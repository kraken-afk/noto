import { hydrateRoot } from 'react-dom/client';
import Page from './register';

const propsScript = document.getElementById('__DJANGO_PROPS__');
const props = JSON.parse(
  // biome-ignore lint: any
  propsScript!.textContent || '',
);
const root = document.getElementById('root');

if (!root) {
  throw Error('Element with id of root must be available');
}

hydrateRoot(root, <Page {...props} />);
propsScript?.remove();
