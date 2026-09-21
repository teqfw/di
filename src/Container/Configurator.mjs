// @ts-check

/**
 * @namespace TeqFw_Di_Container_Configurator
 * @description Materializes declarative Container policy before public entry resolution.
 */

import TeqFw_Di_Container_Hardener from './Hardener.mjs';
import TeqFw_Di_Container_Lifecycle from './Lifecycle.mjs';
import TeqFw_Di_Container_Postprocessor from './Postprocessor.mjs';
import {createNoopObserver} from './Observer.mjs';
import {executeResolution} from './Resolution.mjs';

/** @typedef {import('../Dto/Container/Config.mjs').default} TeqFw_Di_Dto_Container_Config */

/**
 * Materializes policy producers with mappings and default policy only.
 *
 * @param {{config: TeqFw_Di_Dto_Container_Config, canonicalizer: TeqFw_Di_Container_Canonicalizer, moduleRouter: TeqFw_Di_Container_ModuleRouter, moduleLoader: TeqFw_Di_Container_ModuleLoader, producer: TeqFw_Di_Container_Producer, wrapper: TeqFw_Di_Container_Wrapper, hardener: TeqFw_Di_Container_Hardener, postprocessor: TeqFw_Di_Container_Postprocessor, logger: TeqFw_Di_Internal_Logger_Contract}} deps
 * @returns {Promise<void>}
 */
export async function configureContainer(deps) {
    const {
        config,
        canonicalizer,
        moduleRouter,
        moduleLoader,
        producer,
        wrapper,
        hardener,
        postprocessor,
        logger,
    } = deps;
    const policyLifecycle = new TeqFw_Di_Container_Lifecycle(logger);
    const policyPostprocessor = new TeqFw_Di_Container_Postprocessor({logger});
    const policyHardener = new TeqFw_Di_Container_Hardener();
    const observer = createNoopObserver();

    /**
     * Resolves one configuration policy producer without applying configured
     * policy components to the policy-materialization corridor itself.
     *
     * @param {string} specifier
     * @returns {Promise<unknown>}
     */
    const resolvePolicy = async function (specifier) {
        return executeResolution({
            canonicalizer,
            lifecycle: policyLifecycle,
            moduleRouter,
            moduleLoader,
            producer,
            postprocessor: policyPostprocessor,
            wrapper,
            hardener: policyHardener,
            findMock() {
                return {found: false, value: undefined};
            },
            logger,
            observer,
        }, specifier);
    };

    /** @type {Array<(depId: TeqFw_Di_Dto_DepId, context: TeqFw_Di_Container_ResolutionContext) => TeqFw_Di_Dto_DepId>} */
    const configuredPreprocessors = [];
    /** @type {Array<(value: unknown, context: TeqFw_Di_Container_ResolutionContext) => unknown>} */
    const configuredPostprocessors = [];
    /** @type {((value: unknown) => unknown)|null} */
    let configuredHardener = null;

    for (const specifier of config.preprocessors) {
        configuredPreprocessors.push(/** @type {(depId: TeqFw_Di_Dto_DepId, context: TeqFw_Di_Container_ResolutionContext) => TeqFw_Di_Dto_DepId} */ (await resolvePolicy(specifier)));
    }
    for (const specifier of config.postprocessors) {
        configuredPostprocessors.push(/** @type {(value: unknown, context: TeqFw_Di_Container_ResolutionContext) => unknown} */ (await resolvePolicy(specifier)));
    }
    if (config.hardener !== null) {
        configuredHardener = /** @type {(value: unknown) => unknown} */ (await resolvePolicy(config.hardener));
    }

    for (const fn of configuredPreprocessors) canonicalizer.add(fn);
    for (const fn of configuredPostprocessors) postprocessor.add(fn);
    if (configuredHardener !== null) hardener.setConfigured(configuredHardener);
}
