import { ImagePickerDialog } from '@/app/admin/media/_components/image-picker';
import type { Editor } from '@tiptap/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ImageEditBlockProps {
  editor: Editor;
  close: () => void;
}

export const ImageEditBlock: React.FC<ImageEditBlockProps> = ({ editor, close }) => {
  const [link, setLink] = React.useState('');
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (link) {
        editor.commands.setImage({ src: link });
        close();
      }
    },
    [editor, link, close],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="image-link">Attach an image link</Label>
        <div className="flex">
          <Input
            id="image-link"
            type="url"
            required
            value={link}
            className="grow"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLink(e.target.value)}
          />
          <Button type="submit" className="ml-2 h-10">
            Submit
          </Button>
        </div>
      </div>
      <Button type="button" className="h-10 w-full" onClick={() => setOpenDialog(true)}>
        Select from gallery
      </Button>
      <ImagePickerDialog
        onChange={(e) => {
          setOpenDialog(false);
          close();
          if (!e) return;
          editor.commands.setImage({ src: e });
        }}
        allowTypes={['image']}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
      />
    </form>
  );
};

export default ImageEditBlock;
