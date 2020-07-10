// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');
const axios = require('axios');
let isValidAccount;
let memberGlobalName;


class Bot extends ActivityHandler {
    constructor(conversationState, userState, dialog) {
        super();

        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');
        const notValidMemberMessage = `We can't identify you ${ memberGlobalName }. Please contact to support skype`;

        this.onMessage(async (context, next) => {
            if (isValidAccount)
                await this.dialog.run(context, this.dialogState);
            else
                await context.sendActivity(MessageFactory.text(notValidMemberMessage, notValidMemberMessage));

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    const memberName = membersAdded[cnt].name; //process.env.DefaultSkypeName
                    memberGlobalName = memberName;

                    const request_options = {
                        url: `http://10.0.22.56/api/v1.0?api_key=${ process.env.BotApiKey }`,
                        method: 'POST',
                        data: {'id': null, 'jsonrpc': '2.0', 'method': 'account:get_list', 'params': {'filter': {'messenger': memberName}}},
                    };
                    const account_request = await axios(request_options);
                    const accounts = account_request['data']['result']['account_list'];
                    isValidAccount = accounts.length === 1 ? accounts.shift() : null;

                    const addMemberMesage = `Welcome to Premiumy Dialog Bot ${ memberName }. This bot provides a allocation.`;
                    const notValidMemberMessage = `We can't identify you ${ memberGlobalName }. Please contact to support skype`;

                    if (isValidAccount) {
                        await context.sendActivity(MessageFactory.text(addMemberMesage, addMemberMesage));
                    } else {
                        await context.sendActivity(MessageFactory.text(notValidMemberMessage, notValidMemberMessage));
                    }
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
