/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N'],

    (N) => {

        const { search, record, file, render, log, encode, runtime } = N;

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
            } else {
                searchObject.filters.push('AND');
                searchObject.filters.push(['trandate', 'onorafter', '01/06/2023']);
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

        const execute = (scriptContext) => {

            let currentScript = runtime.getCurrentScript();

            let start = currentScript.getParameter({ name: 'custscript_bm_startdate' });;
            let end = null;

            log.debug('Start', start);

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

            xlsFile.name = 'ReporteMasivo.xls';
            xlsFile.folder = 27757;
            xlsFile.save();



        }

        return { execute }

    });
