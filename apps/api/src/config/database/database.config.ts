import { ConnectionOptions } from 'typeorm';
import { DesignPattern } from '../../modules/design-pattern/design-pattern.entity';
import { File } from '../../modules/file/file.entity';
import { Project } from '../../modules/project/project.entity';
import { ProjectFileUploadJob } from '../../modules/file-upload-job/project-file-upload-job.entity';
import { ProjectFileUploadJobLine } from '../../modules/file-upload-job/project-file-upload-job-line.entity';
import { ResponseEditHistory } from '../../modules/response/response-edit-history.entity';
import { Response } from '../../modules/response/response.entity';
import { User } from '../../modules/user/user.entity';
import { Option } from '../../modules/option/option.entity';

export function getDbConnectionOptions() {
  const options = {
    name: process.env.DB_CONN_NAME,
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_NAME,
    entities: [DesignPattern, Project, File, ProjectFileUploadJob, ProjectFileUploadJobLine, Response, ResponseEditHistory, User, Option],
    synchronize: process.env.API_DEPLOY_MODE === 'DEV' ? true : false,
  } as ConnectionOptions;

  return options;
}
