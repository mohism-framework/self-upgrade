import ActionBase from '@mohism/cli-wrapper/dist/libs/action.class';
import { ArgvOption, Dict } from '@mohism/cli-wrapper/dist/libs/utils/type';
import { blue, green, red } from 'colors';
import { existsSync } from 'fs';
import shelljs from 'shelljs';

import { bitsify, getLatestVersion, versionCompare } from './func';


class SelfUpgrade extends ActionBase {
  options(): Dict<ArgvOption> {
    return {};
  }

  description(): string {
    return `Upgrade ${this.instance.name}`;
  }

  async run(argv: Dict<any>): Promise<any> {
    let currentVersion = '9999.9999.9999';
    let latestVersion = '0.0.0';
    let name: string = '';
    if (existsSync(`${this.instance.root}/package.json`)) {
      const pkg = require(`${this.instance.root}/package.json`);
      currentVersion = pkg.version;
      name = pkg.name;
    }
    this.info(`Current Version: ${currentVersion}`);
    if (name !== '') {
      try {
        latestVersion = getLatestVersion(name);
      } catch (e) {
        this.err(e.message);
        process.exit(0);
      }
    }
    this.info(`Latest Version: ${latestVersion}`);
    const [bit, signal]: [number, boolean] = versionCompare(bitsify(latestVersion), bitsify(currentVersion));
    if (signal) {
      // need upgrade
      switch (bit) {
        case 0:
          this.warn(red('Major version differences, not recommended for upgrade'));
          break;
        case 1:
        case 2:
          this.info(`Ready to upgrade: ${blue(currentVersion)} --> ${green(latestVersion)}`);
          this.info('🐌   🐌 🐌 Wait ... ');
          
          const spawn = shelljs.exec(`npm i -g ${name}`, {
            silent: true,
          });
          if (spawn.code !== 0) {
            this.err(spawn.stderr);
            this.warn('You may need to add ‘sudo’'.blue);
            process.exit(0);
          }
          
          this.info(`Successful upgrade: ${name.yellow}@${latestVersion.green}`.white);
          break;
      }
    } else {
      this.info(`Current version ${currentVersion} does not require to upgrade`);
    }
  }
}

export default new SelfUpgrade();