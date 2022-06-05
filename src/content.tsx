import React, { ChangeEvent } from 'react'
import {SourceMapConsumerConstructor} from "source-map"
import StackTracey from 'stacktracey'
import {ErrorOverlay, overlayId, ErrorPayload} from "./overlay"

// @ts-ignore
const SourceMapConsumer = window.sourceMap.SourceMapConsumer as SourceMapConsumerConstructor;

async function getSourceLine(sourceMapFileContent: string, line: number, column: number) {
  const rawSourceMap = JSON.parse(sourceMapFileContent);
  await SourceMapConsumer.with(rawSourceMap, null, consumer => {

    const originalPosition = consumer.originalPositionFor({
      line: line,
      column: column
    })
    console.log(originalPosition)
    if(originalPosition.source === null || originalPosition.line === null) {
      return null;
    }

    const sourceContent = consumer.sourceContentFor(originalPosition.source);
    const codes = sourceContent?.split('\n').slice(originalPosition.line - 10, originalPosition.line+10).join('\n')

    if(!hasErrorOverlay()) {
      createErrorOverlay({
        message: codes as string,
        stack: `//     // 错误所对应的源码
        //     const sourceContent = consumer.sourceContentFor(originalPosition.source);
        //     console.log(sourceContent);
        // }"`,
        plugin: 'string',
        frame: "consumer.originalPositionFor",
        loc: {
          file: originalPosition.source,
          line: originalPosition.line,
          column: originalPosition.column as number,
        }
      })
    }
   
  
  })

//   for (const frame of tracey) { // 这里的frame就是stack中的一行所解析出来的内容
//     // originalPosition不仅仅是行列信息，还有错误发生的文件 originalPosition.source
//     const originalPosition = consumer.originalPositionFor({
//         line: frame.line,
//         column: frame.column,
//     });

//     // 错误所对应的源码
//     const sourceContent = consumer.sourceContentFor(originalPosition.source);
//     console.log(sourceContent);
// }

}

async function getErrorStack(params:type) {
    // const tracey = new StackTracey(errorStack); // 解析错误信息

}


export function Content() {
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    // @ts-ignore
    if(event.target.files?.length > 0) {
      // @ts-ignore
      readFileToString(event.target.files[0]).then(content => {
        getSourceLine(content, 1, 71893)
      })
    }
    
  }
  return (
    <div>
      <input type="file" onChange={onFileChange} accept=".map" />
    </div>
  )
}

async function readFileToString(file: File) {
  const reader = new FileReader();
  return new Promise<string>((resolve, reject) => {
    reader.onload = () => {
      resolve(reader.result as string);
    }
    reader.onerror = reject;
    reader.readAsText(file);
  })
}


function createErrorOverlay(err: ErrorPayload['err']) {
  clearErrorOverlay()
  document.body.appendChild(new ErrorOverlay(err))
}

function clearErrorOverlay() {
  document
    .querySelectorAll(overlayId)
    .forEach((n) => (n as ErrorOverlay).close())
}

function hasErrorOverlay() {
  return document.querySelectorAll(overlayId).length
}
