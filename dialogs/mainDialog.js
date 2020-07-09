// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ChoicePrompt, ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog } = require('botbuilder-dialogs');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

class MainDialog extends ComponentDialog {
    constructor() {
        super('MainDialog');

        // Define the main dialog and its related components.
        this.addDialog(new ChoicePrompt('allocationPrompt'));
        this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
            this.choiceAllocationStep.bind(this),
            this.showAllocationStep.bind(this)
        ]));

        // The initial child Dialog to run.
        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();

        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }

    }

    /**
     * 1. Prompts the user if the user is not in the middle of a dialog.
     * 2. Re-prompts the user when an invalid input is received.
     *
     * @param {WaterfallStepContext} stepContext
     */
    async choiceAllocationStep(stepContext) {
        // Create the PromptOptions which contain the prompt and re-prompt messages.
        // PromptOptions also contains the list of choices available to the user.
        const options = {
            prompt: 'What card would you like to see? You can click or type the card name',
            retryPrompt: 'That was not a valid choice, please select a card or number from 1 to 9.',
            choices: this.getChoices()
        };

        // Prompt the user with the configured PromptOptions.
        return await stepContext.prompt('allocationPrompt', options);
    }

    /**
     * Send a Rich Card response to the user based on their choice.
     * This method is only called when a valid prompt response is parsed from the user's response to the ChoicePrompt.
     * @param {WaterfallStepContext} stepContext
     */
    async showAllocationStep(stepContext) {
        switch (stepContext.result.value) {
        case 'Google Allocation':
            await stepContext.context.sendActivity(this.allocateByGoogle());
            break;
        case 'Mass Allocation':
            await stepContext.context.sendActivity(this.allocateByMass());
            break;
        case 'Number Allocation':
            await stepContext.context.sendActivity(this.allocateByNumber());
            break;
        default:
            break;
        }

        // Give the user instructions about what to do next
        await stepContext.context.sendActivity('Type anything to see another card.');

        return await stepContext.endDialog();
    }

    /**
     * Create the choices with synonyms to render for the user during the ChoicePrompt.
     * (Indexes and upper/lower-case variants do not need to be added as synonyms)
     */
    getChoices() {
        return [
            {
                value: 'Google Allocation',
                synonyms: ['google', 'google allocation']
            },
            {
                value: 'Mass Allocation',
                synonyms: ['mass', 'mass allocation']
            },
            {
                value: 'Number Allocation',
                synonyms: ['number', 'number allocation']
            }
        ];
    }

    // ======================================
    // Helper functions used to create cards.
    // ======================================

    allocateByGoogle() {
        console.log('Google');
        return "Google";
    }
    allocateByMass() {
        console.log('Mass');
        return "Mass";
    }
    allocateByNumber() {
        console.log('Number');
        return "Number";
    }
}

module.exports.MainDialog = MainDialog;
