import { mount } from 'svelte';
import App from './App.svelte';
import './lib/styles/tokens.css';
import './lib/styles/global.css';

if (import.meta.env.DEV) {
  import('./lib/services/learning/selfcheck').then((m) => m.runLearningSelfChecks());
}

const app = mount(App, { target: document.getElementById('app')! });
export default app;
