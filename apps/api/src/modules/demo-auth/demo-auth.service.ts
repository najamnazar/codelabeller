import { ConflictException, Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { uniqueNamesGenerator, Config, names } from 'unique-names-generator';
import { toPng } from 'jdenticon';
import * as fs from 'fs-extra';
import { join } from 'path';
import { DesignPattern } from '../design-pattern/design-pattern.entity';
import { Option } from '../option/option.entity';
import { Project } from '../project/project.entity';
import { File } from '../file/file.entity';
import { ResponseEditHistory } from '../response/response-edit-history.entity';
import { Response } from '../response/response.entity';
import { User } from '../user/user.entity';
import { getConnectionManager } from 'typeorm';
import { Job, scheduleJob } from 'node-schedule';
import { ProjectFileUploadJobLine } from '../file-upload-job/project-file-upload-job-line.entity';
import { ProjectFileUploadJob } from '../file-upload-job/project-file-upload-job.entity';

@Injectable()
export class DemoAuthService {
    private readonly dbConnName = process.env.DB_CONN_NAME;

    DatabaseResetJob: Job;
  
    constructor() {
      // Reset the database and corpus on the hour, every hour.
      this.DatabaseResetJob = scheduleJob('0 * * * *', async function () {
        console.log(`${new Date().toUTCString()}: Resetting database.`);
  
        await getConnectionManager()
          .get(process.env.DB_CONN_NAME)
          .transaction("SERIALIZABLE", async transactionalEntityManager => {
            await transactionalEntityManager.createQueryBuilder()
              .delete()
              .from(Option)
              .execute();

            await transactionalEntityManager.createQueryBuilder()
              .delete()
              .from(ResponseEditHistory)
              .execute();

            await transactionalEntityManager.createQueryBuilder()
              .delete()
              .from(Response)
              .execute();

            await transactionalEntityManager.createQueryBuilder()
              .delete()
              .from(User)
              .execute();

            await transactionalEntityManager.createQueryBuilder()
              .delete()
              .from(DesignPattern)
              .execute();

            await transactionalEntityManager.createQueryBuilder()
              .delete()
              .from(ProjectFileUploadJobLine)
              .execute();

            await transactionalEntityManager.createQueryBuilder()
              .delete()
              .from(ProjectFileUploadJob)
              .execute();

            await transactionalEntityManager.createQueryBuilder()
              .delete()
              .from(File)
              .execute();

            await transactionalEntityManager.createQueryBuilder()
              .delete()
              .from(Project)
              .execute();

            await transactionalEntityManager.createQueryBuilder()
              .insert()
              .into(Option)
              .values([
                { name: 'unlistedUsersAllowed', value: true },
              ])
              .execute();

              await transactionalEntityManager.createQueryBuilder()
              .insert()
              .into(DesignPattern)
              .values([
                { id: '00c169d5-e8a5-98d3-9081-99ef8c64c279', name: 'Facade', isActive: true, explanationRequired: false },
                { id: '12787093-0d65-c57e-e65f-cc47f2170d38', name: 'Visitor', isActive: true, explanationRequired: false },
                { id: '2ed500a3-5296-3717-5e67-5a8791b7c56e', name: 'Singleton', isActive: true, explanationRequired: false },
                { id: '431387eb-7262-e1cf-c79b-125eb8a67c60', name: 'Proxy', isActive: true, explanationRequired: false },
                { id: '4a33adf5-7479-081c-24c1-25a580d9ee2a', name: 'Decorator', isActive: true, explanationRequired: false },
                { id: '7c27535f-88ba-e951-9ceb-14a8983c57ff', name: 'Wrapper', isActive: true, explanationRequired: false },
                { id: '8a7a38cf-a57d-4ac9-8cce-d700b804556a', name: 'Adapter', isActive: true, explanationRequired: false },
                { id: '9549dd60-65d0-1921-1460-c59a86dd6536', name: 'Factory', isActive: true, explanationRequired: false },
                { id: 'b2405bb4-162a-ffa5-7b17-8993a1609f3d', name: 'Memento', isActive: true, explanationRequired: false },
                { id: 'c18462a3-5a7a-f69a-3eea-94f84b7d6a46', name: 'Prototype', isActive: true, explanationRequired: false },
                { id: 'c87a8ca6-0f08-91b7-9d19-2fa86f019916', name: 'Builder', isActive: true, explanationRequired: false },
                { id: 'dfda0d32-069b-96bf-6c4e-a352feffd1b2', name: 'Observer', isActive: true, explanationRequired: false },
                { id: '316deb74-e482-40a7-823c-892b5915318c', name: '~Other Pattern~', isActive: true, explanationRequired: true }
              ])
              .execute();

              await transactionalEntityManager.createQueryBuilder()
              .insert()
              .into(Project)
              .values([
                // Add project records here, for example:
                // { id: '30b9f954-84b7-45ad-9af2-27f40a1f6009', name: 'Project A', isActive: true },
                // { id: 'b6f5f885-7bc3-4012-b5f6-6956c003e8df', name: 'Project B', isActive: true },
              ])
              .execute();

            await transactionalEntityManager.createQueryBuilder()
              .insert()
              .into(File)
              .values([
                // Add source file records here, for example:
                // { id: '01517f1c-2d8d-437a-ceab-73d5f15529c5', path: 'src/sample', name: 'FileX.java', numRequiredResponses: 5, isAcceptingResponses: true, isActive: true,	project: { id: 'b6f5f885-7bc3-4012-b5f6-6956c003e8df' }},
                // { id: '01dcc7dc-d3fb-3de2-a80b-52b293ac1944', path: 'src/anothersample', name: 'FileY.java', numRequiredResponses: 3, isAcceptingResponses: true, isActive: true,	project: { id: '30b9f954-84b7-45ad-9af2-27f40a1f6009' }},
              ])
              .execute();

              const corpusPath = process.env.CORPUS_ABSOLUTE_PATH;
              const demoCorpusPath = process.env.DEMO_BASE_CORPUS_ABSOLUTE_PATH;
              await fs.rm(corpusPath, { recursive: true, force: true });
              await fs.copy(demoCorpusPath, corpusPath, { recursive: true });
          });
      });
    }
  
  private config: Config = {
    dictionaries: [names]
  }

  async getTokenForAccount(email: string) {
    const user = await this.getAccount(email);

    const payload = {
      "sub": user.id,
      "given_name": user.givenName,
      "family_name": user.familyName,
      "email": email,
      "picture": `data:image/png;base64, ${Buffer.from(toPng(email, 40)).toString('base64')}`,
    }

    return sign(payload, process.env.DEMO_JWT_SIGNING_KEY, {
      issuer: `https://${process.env.API_DOMAIN_NAME}`,
      expiresIn: '1h'
    });
  }

  async createDemoAccount(): Promise<User> {
    const givenName = uniqueNamesGenerator(this.config);
    const familyName = uniqueNamesGenerator(this.config);

    if (await this.doesDemoAccountExist(this.getEmailFromName(givenName, familyName))) {
      throw new ConflictException('The user to create already exists. Please try again.');
    }

    return await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(User)
      .save({
        id: undefined,
        timeCreated: undefined,
        lastSeen: undefined,
        currentFile: undefined,
        givenName: givenName,
        familyName: familyName,
        email: this.getEmailFromName(givenName, familyName),
        isEnabled: true,
        isAdmin: true,
        responses: [],
        responseCount: 0
      });
  }

  async doesDemoAccountExist(email: string) {
    const user = await this.getAccount(email);

    if (user) {
      return true;
    }

    return false;
  }

  async getAccount(email: string) {
    return await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(User, 'user')
      .where('user.email = :email', { email: email })
      .getOne();
  }

  getEmailFromName(givenName: string, familyName: string) {
    return `${givenName}.${familyName}@demo.${process.env.API_DOMAIN_NAME}`;
  }
}
