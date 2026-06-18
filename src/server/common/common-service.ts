import prisma from '@/lib/prisma';
import commonSchema from './common-schema';
import z from 'zod';
import APIError from '@/lib/api-error';
import { authClient } from '@/lib/auth-client';
import settingService from '../settings/setting-service';
import userService from '../users/user-service';
import {
  allowedImageTypes,
  FREE_USER_HISTORY_EXPIRATION_DAYS,
  PAID_USER_HISTORY_EXPIRATION_DAYS,
} from '@/data/constans';
import { uploadService } from '@/lib/services/upload-service';
import moment from 'moment-timezone';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

const waitForPrediction = async (predictionId: string, apiKey: string): Promise<string> => {
  const maxAttempts = 30;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new APIError('Failed to check prediction status.');
    }

    const data = await response.json();
    if (data.status === 'succeeded') {
      if (!data.output) {
        throw new APIError('Replicate completed the task but did not return any output image.');
      }
      return data.output;
    }
    if (data.status === 'failed') {
      throw new APIError(data.error || 'Prediction failed.');
    }
  }
  throw new APIError('Image processing took too long. Please try again.');
};

const handlePredictionResponse = async (data: any, apiKey: string): Promise<string> => {
  if (data.status === 'succeeded') {
    if (!data.output) {
      throw new APIError('Replicate completed the task but did not return any output image.');
    }
    return data.output;
  }
  if (data.status === 'failed') {
    throw new APIError(data.error || 'Prediction failed.');
  }
  return await waitForPrediction(data.id, apiKey);
};

const adminStats = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [imagesProcessed, creditsUsed, totalEarning, usersCount] = await prisma.$transaction([
    prisma.history.count(),
    prisma.history.count({
      where: {
        isFree: false,
      },
    }),
    prisma.payment.aggregate({
      _sum: {
        price: true,
      },
    }),
    prisma.user.count(),
  ]);

  return {
    usersCount,
    imagesProcessed,
    creditsUsed,
    totalEarning,
  };
};

const setupApp = async (body: z.infer<typeof commonSchema.setupAppSchema>) => {
  const user = await prisma.user.findFirst();
  if (user) {
    throw new APIError('Setup already completed');
  }

  const { applicationName, adminEmail, adminPassword } = body;

  await authClient.signUp.email({
    email: adminEmail.toLowerCase(),
    password: adminPassword,
    name: 'Admin',
  });

  await prisma.user.update({
    where: {
      email: adminEmail.toLowerCase(),
    },
    data: {
      role: 'admin',
      emailVerified: true,
    },
  });

  await settingService.saveSettings('general', {
    applicationName: applicationName,
    siteTitle: '',
    siteDescription: '',
  });

  await settingService.saveSettings('storage', {
    provider: 'local',
  });
};

const checkSetup = async () => {
  const user = await prisma.user.findFirst();
  if (user) {
    return true;
  }

  return false;
};

const removeExpiredEdits = async () => {
  const expiredEdits = await prisma.history.findMany({
    where: {
      isFree: true,
      isDeleted: false,
      createdAt: {
        lt: moment().subtract(FREE_USER_HISTORY_EXPIRATION_DAYS, 'days').toDate(),
      },
    },
    take: 50,
  });

  for (const edit of expiredEdits) {
    await uploadService.deleteMediaByUrl(edit.inputUrl);
    await uploadService.deleteMediaByUrl(edit.outputUrl);
    if (edit.maskUrl) {
      await uploadService.deleteMediaByUrl(edit.maskUrl);
    }
    await prisma.history.update({
      where: {
        id: edit.id,
      },
      data: {
        isDeleted: true,
      },
    });
  }

  const expiredPaidEdits = await prisma.history.findMany({
    where: {
      isFree: false,
      isDeleted: false,
      createdAt: {
        lt: moment().subtract(PAID_USER_HISTORY_EXPIRATION_DAYS, 'days').toDate(),
      },
    },
    take: 50,
  });

  for (const edit of expiredPaidEdits) {
    await uploadService.deleteMediaByUrl(edit.inputUrl);
    await uploadService.deleteMediaByUrl(edit.outputUrl);
    if (edit.maskUrl) {
      await uploadService.deleteMediaByUrl(edit.maskUrl);
    }
    await prisma.history.update({
      where: {
        id: edit.id,
      },
      data: {
        isDeleted: true,
      },
    });
  }
};

const expiredEdits = async () => {
  const expiredFreeEdits = await prisma.history.findMany({
    where: {
      isFree: true,
      isDeleted: false,
      createdAt: {
        lt: moment().subtract(FREE_USER_HISTORY_EXPIRATION_DAYS, 'days').toDate(),
      },
    },
  });

  const expiredPaidEdits = await prisma.history.findMany({
    where: {
      isFree: false,
      isDeleted: false,
      createdAt: {
        lt: moment().subtract(PAID_USER_HISTORY_EXPIRATION_DAYS, 'days').toDate(),
      },
    },
  });

  return {
    count: expiredFreeEdits.length + expiredPaidEdits.length,
  };
};

const removeObject = async (
  body: z.infer<typeof commonSchema.removeObjectSchema>,
  userId?: string,
) => {
  const { image, imageUrl, mask, isPro } = body;

  const settings = await settingService.getSetting('advanced');
  if (!settings || !settings.aiApiKey) {
    throw new APIError('Advance settings are not configured (Replicate API Key is required)');
  }

  let inputUrl = null;
  const { url: maskUrl } = await uploadService.upload({
    file: mask,
    fileName: mask.name,
    userId,
  });

  if (image) {
    if (!allowedImageTypes.find((type) => type.includes(image.type))) {
      throw new APIError('Invalid image type. Please upload a valid image.');
    }
    const { url } = await uploadService.upload({
      file: image,
      fileName: image.name,
      userId,
    });
    inputUrl = url;
  } else if (imageUrl) {
    const inputArrayBuffer = await fetch(imageUrl).then((res) => res.arrayBuffer());
    const inputBuffer = Buffer.from(inputArrayBuffer);
    const inputFile = new File([inputBuffer], `image.jpg`, {
      type: 'image/jpg',
      lastModified: Date.now(),
    });
    const inputMedia = await uploadService.upload({
      file: inputFile,
      fileName: `image.jpg`,
      userId,
    });
    inputUrl = inputMedia.url;
  }

  if (!inputUrl) {
    throw new APIError('Please provide a valid image');
  }

  let outputUrl = null;

  const inputBody = {
    input: {
      image: inputUrl,
      mask: maskUrl,
    },
  };

  if (userId && isPro === 'true') {
    const credits = await userService.getUserCredits(userId);

    if (credits <= 0) {
      throw new APIError('You do not have enough credits.');
    }

    const response = await fetch('https://api.replicate.com/v1/models/bria/eraser/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'wait',
        Authorization: `Bearer ${settings.aiApiKey}`,
      },
      body: JSON.stringify(inputBody),
    });

    if (!response.ok) {
      console.error(response);
      throw new APIError('Failed to remove object. Please try again later.');
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        credits: { decrement: 1 },
      },
    });

    const data = await response.json();
    outputUrl = await handlePredictionResponse(data, settings.aiApiKey);
  } else {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'wait',
        Authorization: `Bearer ${settings.aiApiKey}`,
      },
      body: JSON.stringify({
        version: '0e3a841c913f597c1e4c321560aa69e2bc1f15c65f8c366caafc379240efd8ba',
        ...inputBody,
      }),
    });

    if (!response.ok) {
      console.error(response);
      throw new APIError('Failed to remove object. Please try again later.');
    }

    const data = await response.json();
    outputUrl = await handlePredictionResponse(data, settings.aiApiKey);
  }

  const response = await fetch(outputUrl);
  const outputArrayBuffer = await response.arrayBuffer();
  const outputBuffer = Buffer.from(outputArrayBuffer);

  // Get image type from response headers or default to jpg
  const imageType = 'image/png';
  const extension = 'png';

  const fileName = `image.${extension}`;

  const outputFile = new File([outputBuffer], fileName, {
    type: imageType,
    lastModified: Date.now(),
  });
  const outputMedia = await uploadService.upload({
    file: outputFile,
    fileName: fileName,
    userId,
  });

  await prisma.history.create({
    data: {
      userId,
      inputUrl: inputUrl,
      outputUrl: outputMedia.url,
      maskUrl: maskUrl,
      isFree: isPro !== 'true',
    },
  });

  return {
    outputUrl: outputMedia.url,
  };
};

const eraseBg = async (body: z.infer<typeof commonSchema.eraseBgSchema>, userId?: string) => {
  const { image, isPro } = body;

  const settings = await settingService.getSetting('advanced');
  if (!settings) {
    throw new APIError('Advance settings are not configured');
  }

  let inputUrl = null;

  if (image) {
    if (!allowedImageTypes.find((type) => type.includes(image.type))) {
      throw new APIError('Invalid image type. Please upload a valid image.');
    }
    const { url } = await uploadService.upload({
      file: image,
      fileName: image.name,
      userId,
    });
    inputUrl = url;
  }

  if (!inputUrl) {
    throw new APIError('Please provide a valid image');
  }

  let finalOutputUrl = null;

  if (settings.bgRemoverProvider === 'local') {
    if (!image) {
      throw new APIError('Please provide a valid image');
    }

    const tempDir = os.tmpdir();
    const tempInputPath = path.join(
      tempDir,
      `input_${Date.now()}_${Math.random().toString(36).substring(7)}.png`,
    );
    const tempOutputPath = path.join(
      tempDir,
      `output_${Date.now()}_${Math.random().toString(36).substring(7)}.png`,
    );

    try {
      const arrayBuffer = await image.arrayBuffer();
      await fs.writeFile(tempInputPath, Buffer.from(arrayBuffer));

      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      const scriptPath = path.join(process.cwd(), 'scripts', 'remove_bg.py');

      await execAsync(`"${pythonCmd}" "${scriptPath}" "${tempInputPath}" "${tempOutputPath}"`);

      const exists = await fs.access(tempOutputPath).then(() => true).catch(() => false);
      if (!exists) {
        throw new APIError('Background removal failed: Output file was not generated.');
      }

      const outputBuffer = await fs.readFile(tempOutputPath);
      const extension = 'png';
      const fileName = `image.${extension}`;
      const outputFile = new File([new Uint8Array(outputBuffer)], fileName, {
        type: 'image/png',
        lastModified: Date.now(),
      });
      const outputMedia = await uploadService.upload({
        file: outputFile,
        fileName: fileName,
        userId,
      });

      finalOutputUrl = outputMedia.url;
    } catch (error: any) {
      console.error('rembg execution error:', error);
      throw new APIError(`Background removal failed: ${error.stderr || error.message}`);
    } finally {
      await fs.unlink(tempInputPath).catch(() => {});
      await fs.unlink(tempOutputPath).catch(() => {});
    }
  } else {
    if (!settings.aiApiKey) {
      throw new APIError('Replicate API Key is not configured in Advanced Settings.');
    }

    let outputUrl = null;
    const inputBody = {
      input: {
        image: inputUrl,
      },
    };

    if (userId && isPro === 'true') {
      const credits = await userService.getUserCredits(userId);

      if (credits <= 0) {
        throw new APIError('You do not have enough credits.');
      }

      const response = await fetch(
        'https://api.replicate.com/v1/models/bria/remove-background/predictions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Prefer: 'wait',
            Authorization: `Bearer ${settings.aiApiKey}`,
          },
          body: JSON.stringify(inputBody),
        },
      );

      if (!response.ok) {
        console.error(response);
        throw new APIError('Failed to remove background. Please try again later.');
      }

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          credits: { decrement: 1 },
        },
      });

      const data = await response.json();
      outputUrl = await handlePredictionResponse(data, settings.aiApiKey);
    } else {
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'wait',
          Authorization: `Bearer ${settings.aiApiKey}`,
        },
        body: JSON.stringify({
          version: 'a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc',
          ...inputBody,
        }),
      });

      if (!response.ok) {
        console.error(response);
        throw new APIError('Failed to remove background. Please try again later.');
      }

      const data = await response.json();
      outputUrl = await handlePredictionResponse(data, settings.aiApiKey);
    }

    const response = await fetch(outputUrl);
    const outputArrayBuffer = await response.arrayBuffer();
    const outputBuffer = Buffer.from(outputArrayBuffer);

    const imageType = 'image/png';
    const extension = 'png';

    const fileName = `image.${extension}`;

    const outputFile = new File([outputBuffer], fileName, {
      type: imageType,
      lastModified: Date.now(),
    });
    const outputMedia = await uploadService.upload({
      file: outputFile,
      fileName: fileName,
      userId,
    });

    finalOutputUrl = outputMedia.url;
  }

  await prisma.history.create({
    data: {
      userId,
      inputUrl: inputUrl,
      outputUrl: finalOutputUrl,
      isFree: isPro !== 'true',
    },
  });

  return {
    outputUrl: finalOutputUrl,
  };
};

const upscaleImage = async (
  body: z.infer<typeof commonSchema.upscaleImageSchema>,
  userId?: string,
) => {
  const { image, isPro } = body;

  const settings = await settingService.getSetting('advanced');
  if (!settings || !settings.aiApiKey) {
    throw new APIError('Advance settings are not configured (Replicate API Key is required)');
  }

  let inputUrl = null;

  if (image) {
    if (!allowedImageTypes.find((type) => type.includes(image.type))) {
      throw new APIError('Invalid image type. Please upload a valid image.');
    }
    const { url } = await uploadService.upload({
      file: image,
      fileName: image.name,
      userId,
    });
    inputUrl = url;
  }

  if (!inputUrl) {
    throw new APIError('Please provide a valid image');
  }

  let outputUrl = null;

  const inputBody = {
    input: {
      image: inputUrl,
    },
  };

  if (userId && isPro === 'true') {
    const credits = await userService.getUserCredits(userId);

    if (credits <= 0) {
      throw new APIError('You do not have enough credits.');
    }

    const response = await fetch(
      'https://api.replicate.com/v1/models/bria/increase-resolution/predictions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'wait',
          Authorization: `Bearer ${settings.aiApiKey}`,
        },
        body: JSON.stringify(inputBody),
      },
    );

    if (!response.ok) {
      console.error(response);
      throw new APIError('Failed to upscale image. Please try again later.');
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        credits: { decrement: 1 },
      },
    });

    const data = await response.json();
    outputUrl = await handlePredictionResponse(data, settings.aiApiKey);
  } else {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'wait',
        Authorization: `Bearer ${settings.aiApiKey}`,
      },
      body: JSON.stringify({
        version: 'f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa',
        ...inputBody,
      }),
    });

    if (!response.ok) {
      console.error(response);
      throw new APIError('Failed to upscale image. Please try again later.');
    }

    const data = await response.json();
    outputUrl = await handlePredictionResponse(data, settings.aiApiKey);
  }

  const response = await fetch(outputUrl);
  const outputArrayBuffer = await response.arrayBuffer();
  const outputBuffer = Buffer.from(outputArrayBuffer);

  const imageType = 'image/png';
  const extension = 'png';

  const fileName = `image.${extension}`;

  const outputFile = new File([outputBuffer], fileName, {
    type: imageType,
    lastModified: Date.now(),
  });
  const outputMedia = await uploadService.upload({
    file: outputFile,
    fileName: fileName,
    userId,
  });

  await prisma.history.create({
    data: {
      userId,
      inputUrl: inputUrl,
      outputUrl: outputMedia.url,
      isFree: isPro !== 'true',
    },
  });

  return {
    outputUrl: outputMedia.url,
  };
};

export default {
  adminStats,
  setupApp,
  checkSetup,
  removeExpiredEdits,
  expiredEdits,
  removeObject,
  eraseBg,
  upscaleImage,
};
