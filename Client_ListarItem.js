/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N'],

    function (N) {

        const { currentRecord, url } = N;

        const scriptId = 'customscript_bm_miprimer_stlt';
        const deployId = 'customdeploy_bm_miprimer_stlt';

        const scriptDownloadId = 'customscript_bm_descargar_stlt';
        const scriptDownloadDeploy = 'customdeploy_bm_descargar_stlt';


        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {

            // setTimeout(() => {

            //     let boton1 = document.getElementById('tr_custpage_button');
            //     boton1.classList.add('pgBntB');

            //     let boton2 = document.getElementById('tr_secondarycustpage_button');
            //     boton2.classList.add('pgBntB');

            // }, 500);

        }

        function ejecutarBoton() {

            let recordContext = currentRecord.get();

            let start = recordContext.getText('custpage_field_from');

            let end = recordContext.getText('custpage_field_to');

            let suitelet = url.resolveScript({
                deploymentId: deployId,
                scriptId: scriptId,
                params: {
                    _start: start,
                    _end: end
                }
            });

            console.log(start);

            setWindowChanged(window, false);
            window.location.href = suitelet;

        }

        function descargar() {
            let recordContext = currentRecord.get();

            let start = recordContext.getText('custpage_field_from');
            let end = recordContext.getText('custpage_field_to');

            let suitelet = url.resolveScript({
                deploymentId: scriptDownloadDeploy,
                scriptId: scriptDownloadId,
                params: {
                    _start: start,
                    _end: end
                }
            });

            setWindowChanged(window, false);

            window.open(suitelet);

        }



        return {
            pageInit: pageInit,
            ejecutarBoton: ejecutarBoton,
            descargar: descargar
        };

    });
