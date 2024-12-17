export const IDL = {
  version: "0.1.0",
  name: "message",
  instructions: [
    {
      name: "setMessage",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "message",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "newMessage",
          type: "string",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "Message",
      type: {
        kind: "struct",
        fields: [
          {
            name: "message",
            type: "string",
          },
        ],
      },
    },
  ],
};
