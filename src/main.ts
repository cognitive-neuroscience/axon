import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

import { browserTracingIntegration, init, replayIntegration } from '@sentry/angular';
import { environment } from './environments/environment';

if (environment.production) {
    init({
        dsn: 'https://1eac536a2ca24255a6faf10c0f3abc39@o4505031493222400.ingest.sentry.io/4505031494467584',
        integrations: [
            replayIntegration({
                maskAllText: false,
                blockAllMedia: false,
            }),
            browserTracingIntegration(),
        ],
        tracesSampleRate: 0.1,
        tracePropagationTargets: ['https://psharplab.campus.mcgill.ca'],
        replaysOnErrorSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
    });
    enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
