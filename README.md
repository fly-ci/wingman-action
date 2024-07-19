<h4 align="center">
  <a href="https://flyci.net/docs/getting-started/flyci-wingman#getting-started-with-flyci-wingman-github-action-recommended">Getting Started</a>
  ·
  <a href="https://flyci.net/docs/flyci-wingman">Docs</a>
  ·
  <a href="https://flyci.net/docs/about/billing#billing-process">Billing</a>
</h4>

# FlyCI Wingman Action

Automatically Fix Your Failing CI Builds. Trust FlyCI Wingman to keep your workflows green.

## Overview

FlyCI Wingman is an autonomous AI agent that analyzes failing CI builds and suggests code changes directly in your pull request. FlyCI Wingman aims to reduce the time developers spend on fixing failing CI builds, increase productivity and allow them to focus more on delivering value.

## What's new

Please refer to the [release page](https://github.com/fly-ci/wingman-action/releases/latest) for the latest release notes.

## Usage

```yaml
- uses: fly-ci/wingman-action@main
  if: failure()
```

### Requirements

#### FlyCI Application

It's required to have [FlyCI app](https://github.com/apps/flyci-prod/installations/select_target) installed for the repo in order for the action to work.

#### Assign required permissions

In order to get authenticated in front of the FlyCI API, the action has to obtain a short-lived access token using a GitHub OpenID Connect (OIDC) token.
For this to work, you have to grant `id-token: write` permission to the job:

```yaml
permissions:
  id-token: write
  contents: read
```

### Supported Runners

Currently, the action is compatible with both self-hosted and GitHub-hosted runners meeting the following criteria:

| Operating System | Architectures |                      Respective <br/> GitHub-hosted runners |
| :--------------- | :------------ | ----------------------------------------------------------: |
| macOS            | arm64         | _macos-latest <br/> macos-14 <br/> macos-13 <br/> macos-12_ |
| ubuntu           | x64           |       _ubuntu-latest <br/> ubuntu-22.04 <br/> ubuntu-20.04_ |
| windows          | x64           |      _windows-latest <br/> windows-2022 <br/> windows-2019_ |

_Note that while it should work on other Linux platforms running on x64 architectures, we do not guarantee that._

---

_For the complete user guide, please refer to our [documentation](https://flyci.net/docs/flyci-wingman)._

## Billing

Currently, FlyCI Wingman is in Beta and **free of charge**. For more information, please see our [Billing](https://flyci.net/docs/about/billing#billing-process) page.

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)

## Feedback Channels

If you would like to report a potential issue, get help, or recommend a feature, please join our [Discord Community](https://github.com/fly-ci/wingman-action/discussions).

Alternatively, send us an email at [support@flyci.net](mailto:support@flyci.net?subject=send-feedback).
