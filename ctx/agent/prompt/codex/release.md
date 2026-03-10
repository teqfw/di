# Task: Prepare a new package release

## Context

The repository contains an npm package.  
Changes have already been made in the working tree and should be included in the next release.

The release type is specified by the human operator.

Release type:

```
RELEASE_TYPE = <patch | minor | major>
```

The agent must determine the next version, update the changelog, and commit the release preparation.

## Responsibilities

The agent must:

1. Detect the current package version.
2. Compute the next version according to the provided release type.
3. Update the version metadata.
4. Update the changelog.
5. Commit the changes.

No additional code changes should be introduced.

## Steps

### 1. Read the current version

Read the current version from:

```
package.json
```

Example:

```
CURRENT_VERSION = MAJOR.MINOR.PATCH
```

### 2. Compute the next version

Use semantic versioning.

Rules:

```
patch → MAJOR.MINOR.(PATCH + 1)
minor → MAJOR.(MINOR + 1).0
major → (MAJOR + 1).0.0
```

Example transformations:

```
2.0.3 + patch → 2.0.4
2.0.3 + minor → 2.1.0
2.0.3 + major → 3.0.0
```

Update the `version` field in:

```
package.json
```

### 3. Update CHANGELOG

Open:

```
CHANGELOG.md
```

Add a new section **at the top of the file**.

Format:

```
## NEW_VERSION - YYYY-MM-DD - <short release title>
```

Below the header add bullet points summarizing the changes included in the release.

Guidelines:

- summarize the main changes included in this release
- keep entries concise
- preserve the formatting style used in existing changelog entries
- do not modify previous entries

Example:

```
## 2.1.0 - 2026-04-12 - Runtime linking improvements

* Improved dependency resolution pipeline.
* Updated container behavior for module wrappers.
* Updated package version metadata to `2.1.0`.
```

Use the current date.

### 4. Commit release preparation

Stage the modified files:

```
package.json
CHANGELOG.md
```

Also include any documentation files changed in the working tree, such as:

```
README.md
PHILOSOPHY.md
docs/
ai/
```

Commit message format:

```
release: prepare NEW_VERSION
```

Example:

```
release: prepare 2.1.0
```

## Result

After completing the task the repository must contain:

- updated version in `package.json`
- new entry in `CHANGELOG.md`
- a commit containing the release preparation
