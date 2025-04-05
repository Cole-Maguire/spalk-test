# Readme

Test an MPEG-4 packet stream to see if it's valid.

## Installation
The only dependencies (other than `typescript`) are `ts-node` to allow easy for an easy runscript and `vitest` for the test harness. Nevertheless, these should be installed before running any other commands using
```
npm i
```

## Running
The parser is the default npm start script, and can be run by passing stdin to it - i.e.

```
cat file.ts | npm start
```

mpeg4-parser is provided as an alias for `npm start`

## Testing
A test suite with that verifies the files provided at https://github.com/SpalkLtd/tech-test, as well as other edge cases is also provided, and can be run using
```
npm test
```