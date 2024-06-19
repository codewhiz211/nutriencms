import { of } from 'rxjs';

export class AuthenticationMockService {
    login(username: string, password: string) {
        return of({});
    }

    logout() {

    }
}
