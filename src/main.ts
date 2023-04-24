import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import * as Sentry from '@sentry/angular-ivy';

Sentry.init({
    dsn: 'https://1eac536a2ca24255a6faf10c0f3abc39@o4505031493222400.ingest.sentry.io/4505031494467584',
    integrations: [
        new Sentry.BrowserTracing({
            tracePropagationTargets: [
                'localhost',
                'localhost:8181',
                'https://psharplab.campus.mcgill.ca',
                'https://psharplab.campus.mcgill.ca/api',
            ],
        }),
        new Sentry.Replay({
            maskAllText: false,
            blockAllMedia: false,
        }),
    ],
    tracesSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
});

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
