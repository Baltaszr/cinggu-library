"""Package the built Cinggu forks without publishing under upstream npm names."""
import io, json, pathlib, tarfile
root = pathlib.Path(__file__).resolve().parents[1]
out = root / 'public' / 'runtime'
out.mkdir(parents=True, exist_ok=True)
base = 'https://cingguexpression.eldadbaltaszar.art/avatar-lab/runtime/'
for name in ('core','react','web'):
    folder = root / 'packages' / ('avatar-' + name)
    package = json.loads((folder / 'package.json').read_text())
    package.pop('scripts', None)
    if name != 'core':
        package['dependencies']['@bible-strong/avatar-core'] = base + 'cinggu-core-20261025.tgz'
    with tarfile.open(out / ('cinggu-' + name + '-20261025.tgz'), 'w:gz') as archive:
        data = json.dumps(package, indent=2).encode()
        info = tarfile.TarInfo('package/package.json'); info.size = len(data)
        archive.addfile(info, io.BytesIO(data))
        for path in ('dist','LICENSE','README.md'):
            if (folder/path).exists(): archive.add(folder/path,arcname='package/'+path)
