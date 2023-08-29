/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N'],

    function (N) {

        const { log, runtime, search, file, email, render, encode, task, redirect } = N;
        const { serverWidget, message } = N.ui;

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

                let form = serverWidget.createForm({
                    title: 'Lista de Item Fulfillments',
                    hideNavBar: false
                });

                form.addSubmitButton({
                    label: 'Exportar/Enviar'
                })

                form.clientScriptModulePath = './Client_ListarItem.js';

                form.addButton({
                    id: 'custpage_button',
                    label: 'Filtrar',
                    functionName: 'ejecutarBoton()'
                })

                form.addButton({
                    id: 'custpage_button_2',
                    label: 'Descargar',
                    functionName: 'descargar()'
                })


                form.addFieldGroup({
                    id: 'custpage_group',
                    label: 'Filters',
                })

                let criteriaStart = form.addField({
                    id: 'custpage_field_from',
                    label: 'Date From',
                    type: 'DATE',
                    container: 'custpage_group'
                })

                let criteriaEnd = form.addField({
                    id: 'custpage_field_to',
                    label: 'To',
                    type: 'DATE',
                    container: 'custpage_group'
                })


                let start = null; end = null;

                let isProcess = 'F';

                if (scriptContext.request.parameters) {
                    start = scriptContext.request.parameters['_start'];
                    end = scriptContext.request.parameters['_end'];
                    isProcess = scriptContext.request.parameters['isProcess'];
                }

                if (isProcess == 'T') {
                    form.addPageInitMessage({
                        type: message.Type.INFORMATION,
                        message: 'Se esta creando un archivo en el file cabinet',
                        duration: 25000
                    });
                }



                let itemfulfillmentList = getSearchResultItemFulfillment(start, end);

                if (start) {
                    criteriaStart.defaultValue = start;
                }

                if (end) {
                    criteriaEnd.defaultValue = end;
                }

                let sublist = form.addSublist({
                    id: 'custpage_list_result',
                    label: 'Item Fullfillments',
                    type: 'STATICLIST'
                });

                sublist.addField({ id: 'custpage_col_tranid', label: 'Tran Id', type: 'text' })
                let colEntity = sublist.addField({ id: 'custpage_col_entity', label: 'Entity', type: 'text' });
                colEntity.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                })

                sublist.addField({ id: 'custpage_col_date', label: 'Date', type: 'text' })
                sublist.addField({ id: 'custpage_col_serie', label: 'Serie', type: 'text' })
                sublist.addField({ id: 'custpage_col_correlativo', label: 'Correlativo', type: 'text' })

                for (var i = 0; i < itemfulfillmentList.length; i++) {

                    let { tranid, entity, trandate, serie, correlativo } = itemfulfillmentList[i];

                    if (tranid) {
                        sublist.setSublistValue({ id: 'custpage_col_tranid', line: i, value: tranid })
                    }

                    if (entity) {
                        sublist.setSublistValue({ id: 'custpage_col_entity', line: i, value: entity })
                    }

                    if (trandate) {
                        sublist.setSublistValue({ id: 'custpage_col_date', line: i, value: trandate })
                    }

                    if (serie) {
                        sublist.setSublistValue({ id: 'custpage_col_serie', line: i, value: serie })
                    }

                    if (correlativo) {
                        sublist.setSublistValue({ id: 'custpage_col_correlativo', line: i, value: correlativo })
                    }

                }

                scriptContext.response.writePage(form);

            } else {

                let start = scriptContext.request.parameters["custpage_field_from"];
                let end = scriptContext.request.parameters["custpage_field_to"];

                /*log.debug('start', start);

                let resultadoItem = getSearchResultItemFulfillment(start, end);

                let csvData = [];

                resultadoItem.forEach(line => {

                    let current = [];
                    current.push(line.tranid);
                    current.push(line.entity);
                    current.push(line.trandate);
                    current.push(line.serie);
                    current.push(line.correlativo);

                    current = current.join(';');
                    csvData.push(current);
                })

                csvData = csvData.join("\r\n");

                let csvFile = file.create({
                    name: 'resultado.csv',
                    fileType: file.Type.CSV,
                    contents: csvData,
                    encoding: file.Encoding.UTF_8,
                });
               

                let xlsContent = file.load('./template/reporte.ftl').getContents();

                let renderer = render.create();

                renderer.templateContent = xlsContent;

                renderer.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: "input",
                    data: {
                        data: JSON.stringify({
                            name: 'Richard Adrian Galvez Lopez',
                            transactions: resultadoItem
                        })
                    }
                });

                let rendererString = renderer.renderAsString();

                let xlsFile = createXLSFile(rendererString);

                let renderer2 = render.create();

                renderer2.templateContent = file.load('./template/pdfreport.ftl').getContents();

                let pdfFile = renderer2.renderAsPdf();

                pdfFile.name = 'Reporte PDF.pdf';


                let user = runtime.getCurrentUser();

                email.send({
                    author: user.id,
                    body: 'Mensaje con Archivo',
                    recipients: 'richy18196@gmail.com',
                    subject: 'Ejemplo de Archivo',
                    attachments: [csvFile, xlsFile, pdfFile]
                })*/


                task.create({
                    taskType: task.TaskType.SCHEDULED_SCRIPT,
                    scriptId: 'customscript_bm_scheduled_script_r',
                    deploymentId: 'customdeploy_bm_scheduled_script_r',
                    params: {
                        custscript_bm_startdate: start
                    }
                }).submit();


                redirect.toSuitelet({
                    scriptId: runtime.getCurrentScript().id,
                    deploymentId: runtime.getCurrentScript().deploymentId,
                    parameters: {
                        '_start': start,
                        '_end': end,
                        'isProcess': 'T'
                    }
                });



            }


        }

        return { onRequest }

    });
