import { cp, mkdir, writeFile } from 'node:fs/promises';

const assets = new URL('./staging-assets/', import.meta.url);
await mkdir(assets, { recursive: true });
await cp(new URL('../kontrolcentral/', import.meta.url), new URL('kontrolcentral/', assets), { recursive: true });
await mkdir(new URL('assets/', assets), { recursive: true });
await cp(new URL('../assets/icon.svg', import.meta.url), new URL('assets/icon.svg', assets));
await writeFile(new URL('push-config.js', assets), 'window.BROK_PUSH_ENDPOINT = location.origin;\n');
await writeFile(new URL('index.html', assets), '<!doctype html><meta charset="utf-8"><title>Kontrolcentralens testmiljø</title><a href="/kontrolcentral/">Åbn Kontrolcentralen</a>');
