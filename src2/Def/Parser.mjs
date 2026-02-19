import TeqFw_Di_Enum_Composition from '../Enum/Composition.mjs';
import TeqFw_Di_Enum_Life from '../Enum/Life.mjs';
import TeqFw_Di_Enum_Platform from '../Enum/Platform.mjs';
import TeqFw_Di_Dto_DepId from '../Dto/DepId.mjs';

export default class TeqFw_Di_Def_Parser {
    #depIdFactory = new TeqFw_Di_Dto_DepId();

    parse(edd) {
        if (typeof edd !== 'string') throw new Error('EDD must be a string.');
        if (edd.length === 0) throw new Error('EDD must be non-empty.');
        if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(edd)) throw new Error('EDD must satisfy AsciiEddIdentifier.');

        let origin = edd;
        let source = edd;
        let platform = TeqFw_Di_Enum_Platform.TEQ;

        if (source.startsWith('node_')) {
            platform = TeqFw_Di_Enum_Platform.NODE;
            source = source.slice(5);
        } else if (source.startsWith('npm_')) {
            platform = TeqFw_Di_Enum_Platform.NPM;
            source = source.slice(4);
        } else if (source.startsWith('teq_')) {
            throw new Error('Explicit teq_ prefix is forbidden.');
        }

        if (source.length === 0) throw new Error('moduleName must be non-empty.');

        const lifecyclePattern = /(\${1,3})(?:_([A-Za-z0-9]+(?:_[A-Za-z0-9]+)*))?$/;
        const lifecycleMatch = source.match(lifecyclePattern);

        let life = null;
        let wrappers = [];
        let core = source;

        if (lifecycleMatch) {
            const marker = lifecycleMatch[1];
            const wrapperTail = lifecycleMatch[2];
            if (marker === '$') life = TeqFw_Di_Enum_Life.SINGLETON;
            else if ((marker === '$$') || (marker === '$$$')) life = TeqFw_Di_Enum_Life.INSTANCE;
            else throw new Error('Lifecycle marker overflow.');

            core = source.slice(0, lifecycleMatch.index);
            if (wrapperTail) {
                wrappers = wrapperTail.split('_');
                for (const one of wrappers) {
                    if (!one) throw new Error('Wrapper must be non-empty.');
                    if (one.includes('$')) throw new Error('Wrapper must not contain $.');
                    if (one.includes('_')) throw new Error('Wrapper must not contain _.');
                }
            }
        } else {
            if (source.includes('$')) throw new Error('Invalid lifecycle marker.');
            const trailing = source.match(/(?:^|[^_])_([a-z][A-Za-z0-9]*)$/);
            if (trailing) {
                throw new Error('Wrapper without lifecycle is forbidden.');
            }
        }

        if (core.includes('$$$$')) throw new Error('Lifecycle marker overflow.');

        const firstDelim = core.indexOf('__');
        const lastDelim = core.lastIndexOf('__');
        if ((firstDelim !== -1) && (firstDelim !== lastDelim)) throw new Error('Export delimiter must appear at most once.');
        if (core.startsWith('__') || core.endsWith('__')) throw new Error('Malformed export segment.');

        let moduleName = core;
        let exportName = null;

        if (firstDelim !== -1) {
            moduleName = core.slice(0, firstDelim);
            exportName = core.slice(firstDelim + 2);
            if (!exportName) throw new Error('Export must be non-empty.');
            if (exportName.includes('_')) throw new Error('Export must not contain _.');
            if (exportName.includes('$')) throw new Error('Export must not contain $.');
        }

        if (!moduleName) throw new Error('moduleName must be non-empty.');
        if (moduleName.startsWith('_') || moduleName.startsWith('$')) throw new Error('moduleName must not start with _ or $.');
        if (moduleName.includes('__')) throw new Error('moduleName must not contain __.');
        if (moduleName.includes('$')) throw new Error('moduleName must not contain $.');

        let composition = TeqFw_Di_Enum_Composition.AS_IS;
        if (exportName !== null) {
            composition = TeqFw_Di_Enum_Composition.FACTORY;
        } else if (life === TeqFw_Di_Enum_Life.SINGLETON) {
            exportName = 'default';
            composition = TeqFw_Di_Enum_Composition.FACTORY;
        } else if (life === TeqFw_Di_Enum_Life.INSTANCE) {
            composition = TeqFw_Di_Enum_Composition.FACTORY;
            if (exportName === null) exportName = 'default';
        }

        return this.#depIdFactory.create({
            moduleName,
            platform,
            exportName,
            composition,
            life,
            wrappers,
            origin,
        }, {immutable: true});
    }
}
