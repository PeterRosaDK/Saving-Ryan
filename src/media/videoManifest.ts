const MEMBER_ALIASES: Readonly<Record<string, string>> = {
  "Peter-BeskyldDavid1": "Peter-BeskyldDavid",
  "Peter-BeskyldMarie1": "Peter-BeskyldMarie",
  "Peter-omRyanDie": "Peter-omRyanDatid",
};

export function resolveVideoMember(memberName: string): string {
  return MEMBER_ALIASES[memberName] ?? memberName;
}

export function getVideoUrl(memberName: string): string {
  const fileName = resolveVideoMember(memberName);
  return `/Video/${encodeURIComponent(fileName)}.mp4`;
}
