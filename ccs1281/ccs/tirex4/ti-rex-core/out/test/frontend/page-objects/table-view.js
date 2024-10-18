'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableView = void 0;
// 3rd party
const protractor_1 = require("protractor");
// our modules
const expect_1 = require("../../expect");
const util_1 = require("../../../frontend/component-helpers/util");
const util_2 = require("./util");
const open_close_helpers_1 = require("./open-close-helpers");
// allows expect().to.exist to work
// tslint:disable:no-unused-expression
// allows us to make each suite function() instead of () =>
// tslint:disable:only-arrow-functions
// so we can await on chai-as-promised statements
// tslint:disable:await-promise
var TableView;
(function (TableView) {
    // Actions
    /**
     * Go to the node associated with the table item. If there are multiple variants you must select one.
     *
     */
    async function selectTableItemNode(tableItemId) {
        await util_2.clickElement(protractor_1.element(protractor_1.by.id(util_1.TEST_ID.tableViewItemNodeLink(tableItemId))));
    }
    TableView.selectTableItemNode = selectTableItemNode;
    /**
     * Go to the readme of the node associated with the table item. If there are multiple variants you must select one.
     *
     */
    async function selectTableItemReadme(tableItemId) {
        await util_2.clickElement(protractor_1.element(protractor_1.by.id(util_1.TEST_ID.tableViewItemReadme(tableItemId))));
    }
    TableView.selectTableItemReadme = selectTableItemReadme;
    async function importTableItem(tableItemId) {
        await util_2.clickElement(protractor_1.element(protractor_1.by.id(util_1.TEST_ID.tableViewItemImport(tableItemId))));
    }
    TableView.importTableItem = importTableItem;
    async function selectVariant(variant) {
        // Select compiler
        const isCompilerEnabled = await protractor_1.element(protractor_1.by.id(util_1.TEST_ID.selectTableItemVariantCompilerContextMenuButton)).isEnabled();
        if (isCompilerEnabled) {
            await protractor_1.browser
                .actions()
                .mouseMove(protractor_1.element(protractor_1.by.id(util_1.TEST_ID.selectTableItemVariantCompilerContextMenuButton)))
                .click()
                .perform();
            await util_2.clickElement(protractor_1.element(protractor_1.by.id(util_1.TEST_ID.selectTableItemVariantCompilerDropdownElementsMenuItem(variant.variant.compiler))));
        }
        // Select kernel
        const isKernelEnabled = await protractor_1.element(protractor_1.by.id(util_1.TEST_ID.selectTableItemVariantKernelContextMenuButton)).isEnabled();
        if (isKernelEnabled) {
            await protractor_1.browser
                .actions()
                .mouseMove(protractor_1.element(protractor_1.by.id(util_1.TEST_ID.selectTableItemVariantKernelContextMenuButton)))
                .click()
                .perform();
            await util_2.clickElement(protractor_1.element(protractor_1.by.id(util_1.TEST_ID.selectTableItemVariantKernelDropdownElementsMenuItem(variant.variant.kernel))));
        }
    }
    TableView.selectVariant = selectVariant;
    async function selectVariantOk() {
        await util_2.clickElement(protractor_1.element(protractor_1.by.id(util_1.TEST_ID.selectTableItemVariantOkButton)));
    }
    TableView.selectVariantOk = selectVariantOk;
    async function selectVariantCancel() {
        await util_2.clickElement(protractor_1.element(protractor_1.by.id(util_1.TEST_ID.selectTableItemVariantCancelButton)));
    }
    TableView.selectVariantCancel = selectVariantCancel;
    // Verify
    async function verifyChangeFilterDisplay(message) {
        await open_close_helpers_1.waitUntilItemOpen(util_1.TEST_ID.tableViewMessage);
        if (message) {
            const text = await protractor_1.element(protractor_1.by.id(util_1.TEST_ID.messageText)).getText();
            expect_1.expect(text).to.deep.equal(message);
        }
    }
    TableView.verifyChangeFilterDisplay = verifyChangeFilterDisplay;
    async function verifyContentDisplay() {
        await open_close_helpers_1.waitUntilItemOpen(util_1.TEST_ID.tableViewDisplay);
    }
    TableView.verifyContentDisplay = verifyContentDisplay;
    async function verifySelectVariantDialog() {
        await open_close_helpers_1.waitUntilItemOpen(util_1.TEST_ID.selectTableItemVariantDialog);
    }
    TableView.verifySelectVariantDialog = verifySelectVariantDialog;
    async function verifyNoSelectVariantDialog() {
        await open_close_helpers_1.waitUntilItemClosed(util_1.TEST_ID.selectTableItemVariantDialog);
    }
    TableView.verifyNoSelectVariantDialog = verifyNoSelectVariantDialog;
    async function verifyVariantSelected(variant, data) {
        const selectedCompiler = await protractor_1.element(protractor_1.by.id(util_1.TEST_ID.selectTableItemVariantKernelContextMenuButton)).getText();
        const selectedKernel = await protractor_1.element(protractor_1.by.id(util_1.TEST_ID.selectTableItemVariantKernelContextMenuButton)).getText();
        const expectedCompiler = data.filterData.compilers.find(item => item.publicId === variant.variant.compiler);
        const expectedKernel = data.filterData.kernels.find(item => item.publicId === variant.variant.kernel);
        expect_1.expect(selectedCompiler).to.deep.equal(expectedCompiler && expectedCompiler.name);
        expect_1.expect(selectedKernel).to.deep.equal(expectedKernel && expectedKernel.name);
    }
    TableView.verifyVariantSelected = verifyVariantSelected;
})(TableView = exports.TableView || (exports.TableView = {}));
