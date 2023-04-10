import React, { useEffect, useRef, useState, useMemo, createRef } from "react";
import { Tooltip, Spin } from "antd";
import {
  MenuFoldOutlined,
  MinusOutlined,
  PlusOutlined,
  CloudDownloadOutlined,
  BookOutlined,
  CustomerServiceOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import classNames from "classnames";

import "antd/dist/reset.css";
import "tailwindcss/tailwind.css";

function App() {
  const pdfRef = useRef<any>(null);
  const [isShowLoading, setShowLoading] = useState(true);
  const [scale] = useState(1.5);
  const [pageNumber, setPageNumber] = useState(1);
  const [viewPage, setViewPage] = useState(1);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const refs = useMemo(
    () =>
      Array.from({ length: pageNumber }).map(() =>
        createRef<HTMLCanvasElement>()
      ),
    [pageNumber]
  );

  const backgroundColor = "#323232";
  const textColor = "#e3e3e3";
  const borderColor = "#4a4a4a";
  const defaultUrl =
    "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";

  useEffect(() => {
    (async function () {
      // We import this here so that it's only loaded during client-side rendering.
      // @ts-ignore
      const pdfJS = await import("pdfjs-dist/build/pdf");
      pdfJS.GlobalWorkerOptions.workerSrc =
        window.location.origin + "/pdf.worker.min.js";
      const pdf = await pdfJS.getDocument(defaultUrl).promise;

      // Set page number
      setPageNumber(pdf.numPages);
      pdfRef.current = pdf;

      setShowLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!isShowLoading && refs && pdfRef.current) {
      (async function () {
        let arrThumbnails: string[] = [];
        for (let i = 0; i < pdfRef.current.numPages; i++) {
          const canvasRef = refs[i];

          const page = await pdfRef.current.getPage(i + 1);
          const viewport = page.getViewport({ scale: scale });

          // Prepare canvas using PDF page dimensions.
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const canvasContext = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render PDF page into canvas context.
            const renderContext = { canvasContext, viewport };
            page.render(renderContext).promise.then(function () {
              arrThumbnails.push(canvas.toDataURL());
            });
          }
        }

        setThumbnails(arrThumbnails);
      })();
    }
  }, [isShowLoading, scale, refs]);

  const onScrollViewport = (e: any) => {
    // Detect active page when scroll
    for (let i = 0; i < pageNumber; i++) {
      const canvasRef = refs[i];
      const clientRect = canvasRef.current?.getBoundingClientRect();

      if (
        clientRect?.top &&
        e.target.scrollTop > clientRect?.top &&
        e.target.scrollTop <= clientRect?.bottom
      ) {
        // Active viewport
        setViewPage(i + 1);
      }
    }
  };

  const onClickThumbnail = (page: number) => {
    if (page && page !== viewPage) {
      setViewPage(page);

      // @todo Scroll to page container
    }
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <main
      className="flex flex-col w-full h-full"
      style={{ background: backgroundColor, color: textColor }}
    >
      <div className="flex flex-none flex-row h-[50px] z-10 px-4 shadow-lg items-center">
        <div className="flex flex-none w-1/5 h-full space-x-6 items-center">
          <span className="flex items-center cursor-pointer">
            <Tooltip title="Đóng Menu">
              <MenuFoldOutlined />
            </Tooltip>
          </span>
          <label className="font-medium text-white">
            compressed.tracemonkey-pldi-09
          </label>
        </div>
        <div className="flex flex-grow justify-center items-center space-x-4">
          <div className="">
            <input
              className="w-[30px] border bg-black-500 rounded text-sm px-2 py-0.5 text-center text-white"
              style={{ borderColor: borderColor }}
              value={viewPage}
            />
            <label> / {pageNumber}</label>
          </div>
          <div
            style={{ background: "#4a4a4a" }}
            className="flex w-[1px] h-[20px]"
          ></div>
          <div className="flex flex-row items-center space-x-4">
            <span className="cursor-pointer">
              <Tooltip title="Thu nhỏ">
                <MinusOutlined />
              </Tooltip>
            </span>
            <input
              className="w-[60px] border bg-black-500 rounded text-sm px-2 py-0.5 text-center text-white"
              style={{ borderColor: "#4a4a4a" }}
              value="100%"
            />
            <span className="cursor-pointer">
              <Tooltip title="Phóng to">
                <PlusOutlined />
              </Tooltip>
            </span>
          </div>
        </div>
        <div className="flex flex-none w-1/5 h-full space-x-8 justify-end items-center">
          <span className="">
            <Tooltip title="Nghe cuốn sách">
              <CustomerServiceOutlined style={{ fontSize: 18 }} />
            </Tooltip>
          </span>
          <span className="">
            <Tooltip title="Tải xuống tập tin">
              <CloudDownloadOutlined style={{ fontSize: 18 }} />
            </Tooltip>
          </span>
          <span className="">
            <Tooltip title="Bookmark">
              <BookOutlined style={{ fontSize: 18 }} />
            </Tooltip>
          </span>
          {/*<span className="flex items-center">*/}
          {/*    <Tooltip title="Gửi vào điện thoại">*/}
          {/*        <SvgIcon name="phone" size={20} />*/}
          {/*    </Tooltip>*/}
          {/*</span>*/}
        </div>
      </div>
      <div className="flex flex-row flex-grow w-full lg:min-h-[500px]">
        <div
          className="flex flex-col w-[300px] border-r overflow-y-auto overflow-x-hidden"
          style={{ borderColor: "#4a4a4a" }}
        >
          <div className="flex flex-col space-y-4 pt-4 overflow-y-auto overflow-x-hidden">
            {!isShowLoading &&
              new Array(pageNumber).fill(1).map((page, key) => {
                const thumbnail = thumbnails[key];

                return (
                  <div
                    onClick={() => onClickThumbnail(key + 1)}
                    key={`thumbnail - ${key}`}
                    className="flex flex-col space-y-2"
                  >
                    <div
                      style={{ borderColor: backgroundColor }}
                      className={classNames(
                        "flex m-auto w-[114px] h-[150px] cursor-pointer bg-white rounded border-4 p-0.5",
                        {
                          "border-blue-400": key + 1 === viewPage,
                        }
                      )}
                    >
                      {thumbnail && <img alt="" src={thumbnail} />}
                    </div>
                    <label className="flex justify-center">{key + 1}</label>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="flex flex-grow relative">
          {isShowLoading ? (
            <div className="absolute left-1/2 top-[200px] -ml-[50px] flex items-center justify-center w-[100px] h-[50px] bg-white rounded">
              <Spin indicator={antIcon} />
            </div>
          ) : null}

          <div
            onScroll={onScrollViewport}
            style={{ background: "#252525", height: 900 }}
            className="flex flex-col w-full overflow-x-hidden overflow-y-auto pt-4 pb-8 space-y-4"
          >
            {!isShowLoading &&
              new Array(pageNumber).fill(1).map((page, key) => {
                const canvasRef = refs[key];

                return (
                  <div key={key} className="mx-auto shadow-lg">
                    <canvas ref={canvasRef} />
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
