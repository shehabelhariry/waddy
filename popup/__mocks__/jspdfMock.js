module.exports = {
  jsPDF: jest.fn().mockImplementation(() => {
    return {
      addPage: jest.fn(),
      setFont: jest.fn(),
      setFontSize: jest.fn(),
      setTextColor: jest.fn(),
      setFillColor: jest.fn(),
      rect: jest.fn(),
      text: jest.fn(),
      addImage: jest.fn(),
      save: jest.fn(),
      getStringUnitWidth: jest.fn().mockReturnValue(0), // Add mock for getStringUnitWidth
      splitTextToSize: jest.fn().mockImplementation(text => [text]), // Add mock for splitTextToSize
      internal: {
        pageSize: {
          getWidth: jest.fn().mockReturnValue(210),
          getHeight: jest.fn().mockReturnValue(297),
        }
      }
    };
  }),
};
