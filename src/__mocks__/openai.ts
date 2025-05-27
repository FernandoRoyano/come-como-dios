const mockCreate = jest.fn().mockResolvedValue({
  choices: [
    {
      message: {
        content: '###JSON_START###{"plan": {"rutina": {"lunes": {"nombre": "Entrenamiento de prueba"}}}}###JSON_END###',
      },
    },
  ],
});

const OpenAI = jest.fn().mockImplementation(() => {
  return {
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  };
});

export default OpenAI;
