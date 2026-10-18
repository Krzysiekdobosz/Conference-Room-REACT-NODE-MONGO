import { httpApi } from './http';
import { mockApi } from './mock';

export const isDemo = import.meta.env.VITE_DEMO === 'true';

export const api = isDemo ? mockApi : httpApi;
