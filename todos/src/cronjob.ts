import { Provider } from '@loopback/core';
import { CronJob, cronJob, CronJobConfig } from '@loopback/cron';
import { repository } from '@loopback/repository';
import { TodoRepository } from './repositories';

@cronJob()
export class CronJobProvider implements Provider<CronJob> {
    constructor(@repository(TodoRepository)
    public todoRepository: TodoRepository) { }

    value() {
        const job = new CronJob({
            name: 'job-B',
            onTick: async () => {
                let count = await this.todoRepository.deleteAll({ isCompleted: true })
                if (count.count > 0) {
                    console.log('cronjob deleted')
                }
            },
            cronTime: '* */5 * * * *',
            start: false,
        });
        return job;
    }
}