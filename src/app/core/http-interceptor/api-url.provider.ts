import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
    ENVIRONMENT_INITIALIZER,
    EnvironmentProviders,
    inject,
    Provider,
} from '@angular/core';
import { apiUrlInterceptor } from './api-url.interceptor';

export const provideApiUrl = (): Array<Provider | EnvironmentProviders> => {
    return [provideHttpClient(withInterceptors([apiUrlInterceptor]))];
};
