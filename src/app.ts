import { mount } from 'svelte'
import './scss/main.scss'
import './scss/app.scss'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app