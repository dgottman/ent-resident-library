# Privacy review checklist

Complete this checklist before publishing every new or changed PDF. The importer
checks only filenames and inferred metadata; it does not certify PDF body
content.

## File and metadata

- [ ] Filename contains no patient name, initials tied to a case, MRN, DOB, date
      of service, accession number, or case-specific identifier.
- [ ] PDF title, author, subject, keywords, and embedded metadata contain no
      protected or unintended personal information.
- [ ] Source-relative folder names contain no patient or confidential data.
- [ ] The synchronization report contains no unresolved privacy warning.

## Every PDF page

- [ ] No patient name, MRN, DOB, visit date, or other identifier appears.
- [ ] No screen capture exposes an EHR header, worklist, browser profile, email,
      file path, institution-only URL, or notification.
- [ ] No clinical image contains identifying labels or recognizable features.
- [ ] No case narrative contains a unique combination that could identify a
      patient.
- [ ] Comments, annotations, attachments, layers, and hidden content were
      reviewed.

## Copyright and editorial review

- [ ] Every image and figure is original, licensed, public domain, or used with
      permission.
- [ ] Sources are cited accurately.
- [ ] Medical content was checked against current primary literature and
      authoritative references.
- [ ] Local protocols are labeled as local rather than universal.
- [ ] Publication status and last-reviewed date are intentional.
- [ ] Disclaimer and author attribution are appropriate.

If any answer is uncertain, leave the guide as `draft` in
`content/guide-overrides.json` and do not publish it.
