import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DripCampaign, DripStep } from './drip.entity';

export interface DripStepInput {
  dayDelay: number;
  time: string;         // "HH:MM" local time
  title: string;
  body: string;
}

export interface DripCampaignWithSteps extends DripCampaign {
  steps: DripStep[];
}

@Injectable()
export class DripService {
  constructor(
    @InjectRepository(DripCampaign)
    private campaignRepository: Repository<DripCampaign>,
    @InjectRepository(DripStep)
    private stepRepository: Repository<DripStep>,
    private dataSource: DataSource,
  ) {}

  async getDripCampaign(internalAppId: number): Promise<DripCampaignWithSteps | null> {
    const campaign = await this.campaignRepository.findOne({
      where: { app_id: internalAppId, is_active: true },
      order: { created_at: 'DESC' },
      relations: ['steps'],
    });

    if (!campaign) {
      return null;
    }

    // Sort steps manually or rely on a query builder
    campaign.steps.sort((a, b) => a.step_number - b.step_number);

    return campaign as DripCampaignWithSteps;
  }

  async saveDripCampaign(
    internalAppId: number,
    name: string,
    steps: DripStepInput[],
    isActive: boolean = true
  ): Promise<DripCampaignWithSteps> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(DripCampaign, { app_id: internalAppId }, { is_active: false });

      const newCampaign = this.campaignRepository.create({
        app_id: internalAppId,
        name,
        is_active: isActive,
      });

      const savedCampaign = await queryRunner.manager.save(newCampaign);

      const insertedSteps: DripStep[] = [];
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const payload = JSON.stringify({ title: step.title, body: step.body });
        const scheduledTime = step.time.length === 5 ? `${step.time}:00` : step.time;

        const newStep = this.stepRepository.create({
          campaign_id: savedCampaign.id,
          step_number: i + 1,
          delay_days: step.dayDelay,
          notification_payload_json: payload,
          scheduled_at_local_time: scheduledTime,
        });

        const savedStep = await queryRunner.manager.save(newStep);
        insertedSteps.push(savedStep);
      }

      await queryRunner.commitTransaction();

      return { ...savedCampaign, steps: insertedSteps } as DripCampaignWithSteps;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async deactivateDripCampaign(internalAppId: number): Promise<void> {
    const result = await this.campaignRepository.update(
      { app_id: internalAppId, is_active: true },
      { is_active: false }
    );

    if (result.affected === 0) {
      throw new NotFoundException('No active drip campaign found for this app');
    }
  }
}
