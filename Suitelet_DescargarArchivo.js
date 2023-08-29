/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N'],

    function (N) {

        const { log, runtime, search, file, email, render, encode } = N;
        const { serverWidget } = N.ui;

        function createXLSFile(content) {

            let base64fileEncodedString = encode.convert({
                string: content,
                inputEncoding: encode.Encoding.UTF_8,
                outputEncoding: encode.Encoding.BASE_64
            });

            return file.create({
                name: 'Reporte.xls',
                fileType: file.Type.EXCEL,
                encoding: file.Encoding.UTF_8,
                contents: base64fileEncodedString,
            })
        }


        function getSearchResultItemFulfillment(start, end) {

            let resultArray = [];

            let searchObject = {
                type: 'itemfulfillment',
                columns: ['tranid', 'entity', 'trandate', 'custbody_ns_series_cxc', 'custbody_ns_num_correlativo'],
                filters: [
                    ['mainline', 'is', 'F']
                ]
            }

            if (start) {
                searchObject.filters.push('AND');
                searchObject.filters.push(['trandate', 'onorafter', start]);
            }

            if (end) {
                searchObject.filters.push('AND');
                searchObject.filters.push(['trandate', 'onorbefore', end]);
            }

            let searchContext = search.create(searchObject)

            let pagedData = searchContext.runPaged({ pageSize: 1000 });

            pagedData.pageRanges.forEach(function (pageRange) {
                var myPage = pagedData.fetch({ index: pageRange.index });
                myPage.data.forEach((row) => {

                    let { columns } = row;
                    let tranid = row.getValue(columns[0]);
                    let entity = row.getText(columns[1]);
                    let trandate = row.getValue(columns[2]);
                    let serie = row.getText(columns[3]);
                    let correlativo = row.getValue(columns[4]);
                    resultArray.push({ tranid, entity, trandate, serie, correlativo });

                });
            });


            return resultArray;

        }


        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        function onRequest(scriptContext) {

            if (scriptContext.request.method == 'GET') {

                let start = null; end = null;

                if (scriptContext.request.parameters) {
                    start = scriptContext.request.parameters['_start'];
                    end = scriptContext.request.parameters['_end'];
                }

                if (!start && !end) {
                    return
                }

                let transactionList = getSearchResultItemFulfillment(start, end);

                let xlsContent = file.load('./template/reporte.ftl').getContents();

                let renderer = render.create();

                renderer.templateContent = xlsContent;

                renderer.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: "input",
                    data: {
                        data: JSON.stringify({
                            name: 'Richard Adrian Galvez Lopez',
                            transactions: transactionList
                        })
                    }
                });

                let rendererString = renderer.renderAsString();

                let xlsFile = createXLSFile(rendererString);

                scriptContext.response.writeFile({
                    file: xlsFile
                });

            }

        }

        return { onRequest }

    });
