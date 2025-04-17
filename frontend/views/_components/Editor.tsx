import type React from 'react';
import { Crepe } from '@milkdown/crepe';
import { Milkdown, useEditor } from '@milkdown/react';

export function Editor({
  initialContent,
  setter,
}: {
  initialContent: string;
  setter: React.Dispatch<React.SetStateAction<string | undefined>>;
}) {
  useEditor(
    (root) => {
      const crepe = new Crepe({
        root,
        defaultValue: initialContent,
        features: {
          'image-block': false,
        },
      });

      crepe.on(
        (listener) =>
          void listener.markdownUpdated((_, markdown) => {
            setter(markdown);
          }),
      );

      return crepe;
    },
    [initialContent],
  );

  return <Milkdown />;
}
