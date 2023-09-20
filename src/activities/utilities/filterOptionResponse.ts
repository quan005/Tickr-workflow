import { OptionDetails, OptionMap } from "@src/interfaces/optionChain";

export function filterOptionResponse(optionMap: OptionMap, optionType: string, budget: number): OptionDetails | null {
    const optionsArray: OptionDetails[] = [];
  
    for (const option in optionMap) {
      console.log('option', option);
  
      if (optionType === "CALL" && optionMap[option][0].delta > 0.5 && optionMap[option][0].delta < 0.8 && optionMap[option][0].ask * 100 <= budget) {
        optionsArray.push(optionMap[option][0]);
      }
  
      if (optionType === "PUT" && optionMap[option][0].delta < -0.7 && optionMap[option][0].delta > -0.95 && optionMap[option][0].ask * 100 <= budget) {
        optionsArray.push(optionMap[option][0]);
      }
    }
  
    console.log('optionsArray', optionsArray);
  
    optionsArray.sort((a, b) => (a.ask > b.ask) ? 1 : -1);
  
    if (optionsArray.length > 2) {
      console.log(`option selected [${optionsArray.length - 1}]`, optionsArray[optionsArray.length - 1]);
      return optionsArray[2];
    } else if (optionsArray.length === 2) {
      console.log('option selected [1]', optionsArray[1]);
      return optionsArray[1];
    } else if (optionsArray.length === 1) {
      console.log('option selected [0]', optionsArray[0]);
      return optionsArray[0];
    }
  
    return null;
}