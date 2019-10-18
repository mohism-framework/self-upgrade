import shelljs from 'shelljs';

export type versionBits = [
  number,
  number,
  number,
];

export const bitsify = (v: string): versionBits => {
  const bits: Array<number> = v.split('.', 3).map((item: string) => +item);
  return [bits[0], bits[1], bits[2]];
}

export const versionCompare = (a: versionBits, b: versionBits): [number, boolean] => {
  for (let i = 0; i < 3; i++) {
    if (a[i] > b[i]) {
      return [i, true];
    }
  }
  return [0, false];
}

export const getLatestVersion = (name: string): string => {
  const spawn = shelljs.exec(`npm show ${name} dist-tags --json`, {
    silent: true,
  });
  if (spawn.code !== 0) {
    throw new Error('can not get latest version');
  }
  const { latest } = JSON.parse(spawn.stdout);
  return latest;
}
