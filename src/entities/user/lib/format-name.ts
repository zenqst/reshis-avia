export function formatName(fullName: string): string {
 const [surname, ...names] = fullName.trim().split(/\s+/u);
 return [surname, names.map(name => `${Array.from(name)[0]}.`).join('')].filter(Boolean).join(' ');
}
