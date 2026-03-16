export function buildS3Key(params: {
  state: string;
  district: string;
  block: string;
  place: string;
  board: string;
  school: string;
  medium: string;
  classGrade: string;
  subject: string;
  sampleType: string;
  gender: string;
  hand: string;
  fileNumber: string;
}): string {
  const slug = (s: string) =>
    s.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

  return [
    slug(params.state),
    slug(params.district),
    slug(params.block),
    slug(params.place),
    slug(params.board),
    slug(params.school),
    slug(params.medium),
    slug(params.classGrade),
    slug(params.subject),
    slug(params.sampleType),
    slug(params.gender),
    slug(params.hand),
    `${slug(params.fileNumber)}.pdf`,
  ].join('/');
}
