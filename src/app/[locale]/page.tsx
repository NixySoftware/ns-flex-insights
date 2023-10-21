'use client';

import {PhotoIcon, TrashIcon} from '@heroicons/react/24/solid';
// @ts-expect-error: Library has no types
import csvToJson from 'convert-csv-to-json';
import {type ChangeEventHandler, useMemo, useState} from 'react';

import {Analytics} from '~/components/Analytics';
import {parseTransactions} from '~/ns';

interface CsvFile {
    file: File;
    rows: Record<string, string>[];
}

const Home: React.FC<Record<string, never>> = () => {
    const [files, setFiles] = useState<CsvFile[]>([]);

    const handleChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
        if (!event.target.files) {
            return;
        }

        setFiles([
            ...files,
            ...(await Promise.all(
                [...event.target.files].map(async (file) => {
                    const text = await file.text();
                    const rows: CsvFile['rows'] = csvToJson
                        .fieldDelimiter(',')
                        .supportQuotedField(true)
                        .csvStringToJson(text);

                    return {
                        file,
                        rows
                    };
                })
            ))
        ]);
    };

    const transactions = useMemo(() => parseTransactions(files.flatMap((file) => file.rows)), [files]);

    return (
        <div className="space-y-12">
            <form>
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                    <div className="col-span-full">
                        <label className="block font-medium leading-6 text-gray-900" htmlFor="file-upload">
                            Travel history
                        </label>
                        <div className="grid grid-cols-2 gap-x-4">
                            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                                <div className="text-center">
                                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                                    <div className="mt-4 flex leading-6 text-gray-600">
                                        <label
                                            className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                                            htmlFor="file-upload"
                                        >
                                            <span>Upload a file</span>
                                            <input
                                                id="file-upload"
                                                className="sr-only"
                                                name="file-upload"
                                                type="file"
                                                accept=".csv"
                                                multiple
                                                onChange={handleChange}
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-sm leading-5 text-gray-600">CSV up to 1 MB</p>
                                </div>
                            </div>
                            <div className="mt-2 flex justify-center rounded-lg border border-gray-900/25">
                                {/* TODO: https://tailwindui.com/components/application-ui/lists/stacked-lists#component-f0f183415de745e81fa742d6e1df9e04 */}
                                {/* TODO: merge that with div above */}
                                <ul role="list" className="divide-y divide-gray-100">
                                    {files.map(({file}) => (
                                        <li
                                            key={file.name}
                                            className="flex items-center justify-between gap-x-6 px-5 py-5"
                                        >
                                            <div>{file.name}</div>
                                            <div>
                                                <TrashIcon
                                                    className="h-4 w-4 cursor-pointer text-gray-300 hover:text-gray-500"
                                                    onClick={() => setFiles(files.filter((f) => f.file !== file))}
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {files.length === 0 && (
                        <div className="col-span-full">
                            <h2 className="font-medium leading-6 text-gray-900">How to use</h2>
                            Upload one or more travel history files to get an insight into your NS Flex costs.
                        </div>
                    )}
                    {files.length > 0 && transactions.length === 0 && (
                        <div className="col-span-full">No transactions in uploaded files.</div>
                    )}
                    {transactions.length > 0 && (
                        <div className="col-span-full">
                            <Analytics transactions={transactions} />
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default Home;
