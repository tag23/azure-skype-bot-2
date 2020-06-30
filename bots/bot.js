// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');

class Bot extends ActivityHandler {
    constructor(conversationState, userState, dialog) {
        super();

        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');
        this.echoEnabled = false;
        console.log('User State: ', this.userState);
        console.log('Conversation State: ', this.conversationState);
        console.log('Dialog State: ', this.dialogState);

        this.onMessage(async (context, next) => {
            if (context.activity.text.includes('Echo enabled')) this.echoEnabled = true;
            if (context.activity.text.includes('Echo disabled')) this.echoEnabled = false;

            if (this.echoEnabled) {
                const replyText = `Echo: ${ context.activity.text }`;

                await context.sendActivity(MessageFactory.text(replyText, replyText));
            } else {
                await this.dialog.run(context, this.dialogState);
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    const welcomeText = `Welcome to Premiumy Dialog Bot ${ membersAdded[cnt].name }. This bot provides a allocation.`;
                    await context.sendActivity(welcomeText);
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    async run(context) {
        await super.run(context);
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }
}

module.exports.Bot = Bot;
