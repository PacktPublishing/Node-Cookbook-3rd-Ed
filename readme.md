# Node Cookbook 3rd Edition

## Outline

[outline.md](outline.md)

## Process

1. Each chapter is a branch, with an associated PR
2. Each PR corresponds to a chapter number, e.g. [#1](/../../pull/1) is the PR for the Chapter-1 branch
3. Co-Authors push to Chapter branches which will update PR's
4. Co-Authors, Reviewers and Proof Readers use Commit Notes (on the Files Changes tab) to add inline comments to the PR which can be addressed by authors
5. Commits are squashed at each draft stage, and final commit named according to state (first-draft, second-draft, complete)
6. Once a chapter is complete, we check in a PDF, merge the branch to master and lock the PR. 
7. Any changes after this step should be avoided if at all possible, since changes after the Complete stage should be rare, any that arise will be direct commits to master.

No other issues or PR's should be opened, all communication should happen in the PR's. 

## Stages

The following labels can be applied to PR's to communicate the status of a chapter:

* [![](https://img.shields.io/badge/%F0%9F%94%96-preparing-d93f0b.svg?style=flat-square)](/../../labels/preparing)
* [![](https://img.shields.io/badge/%F0%9F%94%96-in--progress-ff8833.svg?style=flat-square)](/../../labels/in-progress)
* [![](https://img.shields.io/badge/%F0%9F%94%96-first--draft--complete-1d76db.svg?style=flat-square)](/../../labels/first-draft-complete)
* [![](https://img.shields.io/badge/%F0%9F%94%96-editorial--review-5319e7.svg?style=flat-square)](/../../labels/editorial-review)
* [![](https://img.shields.io/badge/%F0%9F%94%96-technical--editorial--review-d4c5f9.svg?style=flat-square)](/../../labels/technical-editorial-review) 
* [![](https://img.shields.io/badge/%F0%9F%94%96-second--draft--complete-0e8a16.svg?style=flat-square)](/../../labels/second-draft-complete) 
* [![](https://img.shields.io/badge/%F0%9F%94%96-peer--review-fbca04.svg?style=flat-square)](/../../labels/peer-review)
* [![](https://img.shields.io/badge/%F0%9F%94%96-proofreading-888888.svg?style=flat-square)](/../../labels/proofreading) 
* [![](https://img.shields.io/badge/%F0%9F%94%96-addressing--comments-ff69b4.svg?style=flat-square)](/../../labels/addressing-comments)
* [![](https://img.shields.io/badge/%F0%9F%94%96-complete-000000.svg?style=flat-square)](/../../labels/complete)


Some labels can be applied in parallel. The addressing-comments label should be applied alongside the relevant review label, no need to apply
if addressing co-author comments. 

## PDF Output

Use hyperpdf to create a PDF from the markdown

```sh
npm install -g hyperpdf
```

Generate a chapter with `hyperpdf <markdown-file> <pdf-file>`, 
for example:

```sh
hyperpdf 1-Writing-Modules/content.md 1-Writing-Modules.pdf
```

### Todo

* The PDF is generated from markdown rendered as HTML. We need a CSS file that applies the Cookbook brand colours, fonts, etc to this HTML. 