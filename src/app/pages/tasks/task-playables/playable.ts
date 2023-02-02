import { Subject } from 'rxjs';
import { BaseParticipantData } from 'src/app/models/ParticipantData';
import { Navigation } from '../shared/navigation-buttons/navigation-buttons.component';

export interface IOnComplete {
    navigation: Navigation;
    taskData?: BaseParticipantData[];
}

export interface Playable {
    onComplete: Subject<IOnComplete>;

    handleComplete(nav: Navigation, data?: any[]): void;

    configure(metadata: any, config?: any): void;

    afterInit(): void;
}
