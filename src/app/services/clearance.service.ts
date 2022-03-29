import { Injectable } from '@angular/core';
import { SessionStorageService } from './sessionStorage.service';
import { StudyUserService } from './study-user.service';
import { StudyService } from './study.service';
import { TaskManagerService } from './task-manager.service';
import { TaskService } from './task.service';
import { UserService } from './user.service';

export interface CanClear {
    clearService: () => void;
}

@Injectable({
    providedIn: 'root',
})
export class ClearanceService {
    /**
     * This service is used to clear the data cached in local memory when the user logs in so that there aren't any weird
     * behaviors that may occur since we are using the hash location strategy.
     */

    clearServices() {
        this.studyService.clearService();
        this.taskManager.clearService();
        this.taskService.clearService();
        this.userService.clearService();
        this.studyUserService.clearService();
        this.sessionStorageService.clearSessionStorage();
    }

    constructor(
        private studyService: StudyService,
        private taskManager: TaskManagerService,
        private taskService: TaskService,
        private userService: UserService,
        private sessionStorageService: SessionStorageService,
        private studyUserService: StudyUserService
    ) {}
}
