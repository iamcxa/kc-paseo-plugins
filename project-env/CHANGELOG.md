# Changelog

## [0.2.0](https://github.com/iamcxa/kc-paseo-plugins/compare/project-env-v0.1.0...project-env-v0.2.0) (2026-10-24)


### Features

* **project-env:** a save bar shows unsaved changes and Stop managing has its own section ([#23](https://github.com/iamcxa/kc-paseo-plugins/issues/23)) ([af6aaec](https://github.com/iamcxa/kc-paseo-plugins/commit/af6aaec61449ce85b631606c0fea2f4a0270f37b))
* **project-env:** a token is stored only after 1Password accepts it ([#21](https://github.com/iamcxa/kc-paseo-plugins/issues/21)) ([1adf630](https://github.com/iamcxa/kc-paseo-plugins/commit/1adf63042be22646c0192c47028f72a1b1960c11))
* **project-env:** a working 1Password connection collapses to one line ([#25](https://github.com/iamcxa/kc-paseo-plugins/issues/25)) ([681f861](https://github.com/iamcxa/kc-paseo-plugins/commit/681f861ee07c847a83fb59ccb6be27c26960ae95))
* **project-env:** Add opens the field picker and names the variable from the field ([#28](https://github.com/iamcxa/kc-paseo-plugins/issues/28)) ([0314c91](https://github.com/iamcxa/kc-paseo-plugins/commit/0314c91277c02c8ddf03bde93024aad85ac66593))
* **project-env:** Browse vault lists fields even when one item cannot be read ([#16](https://github.com/iamcxa/kc-paseo-plugins/issues/16)) ([7165718](https://github.com/iamcxa/kc-paseo-plugins/commit/7165718a5b837ab4d453798363c90a0d6fd20163))
* **project-env:** each variable row has one field pill showing item and field ([#24](https://github.com/iamcxa/kc-paseo-plugins/issues/24)) ([d197f9d](https://github.com/iamcxa/kc-paseo-plugins/commit/d197f9d1cee1f6e08d1d20974da6709acb22fa57))
* **project-env:** every variable row is findable ([#33](https://github.com/iamcxa/kc-paseo-plugins/issues/33)) ([c46720f](https://github.com/iamcxa/kc-paseo-plugins/commit/c46720fc01192434c7e6e2daab68a017eddcc103))
* **project-env:** one row per variable, Add refuses reserved names ([#17](https://github.com/iamcxa/kc-paseo-plugins/issues/17)) ([15b1e3f](https://github.com/iamcxa/kc-paseo-plugins/commit/15b1e3fcb6aabd039758a290b24e36890910e3fd))
* **project-env:** remove the Conductor import from the variables card ([#41](https://github.com/iamcxa/kc-paseo-plugins/issues/41)) ([4e22d4a](https://github.com/iamcxa/kc-paseo-plugins/commit/4e22d4ad63bc50d4bcc32a403720b429152bad8a))
* **project-env:** Save is off while the connection is being changed, a saved project keeps its place, a stored token refreshes the field list ([#29](https://github.com/iamcxa/kc-paseo-plugins/issues/29)) ([d540a04](https://github.com/iamcxa/kc-paseo-plugins/commit/d540a045c239dd563522b5fc78066b63009ae839))
* **project-env:** test results clear when the draft changes and say what set means ([#20](https://github.com/iamcxa/kc-paseo-plugins/issues/20)) ([985e7e4](https://github.com/iamcxa/kc-paseo-plugins/commit/985e7e4c350488c5b2cff27d8eba25ec09566542))
* **project-env:** Test shows a summary line and marks failed rows with a red border and (!) ([#27](https://github.com/iamcxa/kc-paseo-plugins/issues/27)) ([40849b4](https://github.com/iamcxa/kc-paseo-plugins/commit/40849b49bc727dae0731e797e2b207370946c5c2))
* **project-env:** the field picker is grouped, searchable and suggests the matching field ([#26](https://github.com/iamcxa/kc-paseo-plugins/issues/26)) ([28e2b17](https://github.com/iamcxa/kc-paseo-plugins/commit/28e2b17f5a7bb73fc4c3f9e7636d9c66d57747b6))
* **project-env:** token row names why a token fails and picks the only readable vault ([#15](https://github.com/iamcxa/kc-paseo-plugins/issues/15)) ([948e98a](https://github.com/iamcxa/kc-paseo-plugins/commit/948e98aeb418be30ae63d379af0b20e31bad59f0))
* **project-env:** unsaved edits survive the settings screen re-mounting ([#22](https://github.com/iamcxa/kc-paseo-plugins/issues/22)) ([d61e243](https://github.com/iamcxa/kc-paseo-plugins/commit/d61e24396b42dfb15827bacd6970627c6f6425ba))


### Bug Fixes

* **project-env:** a project saved at a linked worktree serves agents in that worktree ([#19](https://github.com/iamcxa/kc-paseo-plugins/issues/19)) ([7543f95](https://github.com/iamcxa/kc-paseo-plugins/commit/7543f95a595799dafb0b781139b9bddec346d6c6))

## 0.1.0 (2026-10-21)


### Features

* **project-env:** blank failed, empty and late variables, key the cache by account ([6244ff6](https://github.com/iamcxa/kc-paseo-plugins/commit/6244ff6ffa5fcd4300a94f2ff9b2e4c3fd1e06a9))
* **project-env:** import the project-env plugin ([b12c1f8](https://github.com/iamcxa/kc-paseo-plugins/commit/b12c1f804a76006453bc08f9289d3d4df92724a8))
* **project-env:** new agents get each resolved variable; failed, empty and late ones arrive empty ([e061a0f](https://github.com/iamcxa/kc-paseo-plugins/commit/e061a0f5751bc6e651c71b85d73699902c514037))
* **project-env:** refuse a reference outside the chosen vault before any read ([3797ed6](https://github.com/iamcxa/kc-paseo-plugins/commit/3797ed6f035e2ee793ae9f9a5f2cf106c436dba6))
* **project-env:** refuse a reference outside the chosen vault before any read ([a30ad63](https://github.com/iamcxa/kc-paseo-plugins/commit/a30ad6357ae0fb3f2d02f5e990c0d9a28dea7022))
* **project-env:** show each variable an agent started without on its timeline ([cf563c6](https://github.com/iamcxa/kc-paseo-plugins/commit/cf563c6da888c8b235d4aafe6fd54e7e5ca2580f))
* **project-env:** show each variable an agent started without on its timeline ([90074f6](https://github.com/iamcxa/kc-paseo-plugins/commit/90074f64b9d49c55f61a09662cac9b31a173fb87))


### Bug Fixes

* **project-env:** match a connected repository through symlinked or non-canonical paths ([ae64fde](https://github.com/iamcxa/kc-paseo-plugins/commit/ae64fde9fe38990eef3be6f70aaeca99c11a3392))
* **project-env:** match a connected repository through symlinked or non-canonical paths ([2defea5](https://github.com/iamcxa/kc-paseo-plugins/commit/2defea5e13c58735ee736f3d77dd4597f092ed00))
* **project-env:** name a failed variable's cause class, never raw tool output ([dac8940](https://github.com/iamcxa/kc-paseo-plugins/commit/dac8940ca4ef5598cdcd9288fb9bc53681dde9a2))
* **project-env:** name a failed variable's cause class, never raw tool output ([f53d485](https://github.com/iamcxa/kc-paseo-plugins/commit/f53d485f1e963388e8a8b513f483bdb24d65f6e5))
