export function main(s: string): string {
	const message = s + ' world'
	console.log(message);
	return message;
}

const args = process.argv;
main(args[2])
