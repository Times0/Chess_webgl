
export class Square {
    
    constructor(cmdOrLine, row)
    {
      if (typeof cmdOrLine === 'string')
      {
        // Assuming cmd is in the format 'a1', extract the characters
        this.row = cmdOrLine.charCodeAt(0) - 'a'.charCodeAt(0);
        this.line = parseInt(cmdOrLine[1]) - 1;
      }
      else
      {
        // Assuming cmdOrLine is the line and row values
        this.row = row;
        this.line = cmdOrLine;
      }
    }
  
    getLine() {
      return this.line;
    }
  
    getRow() {
      return this.row;
    }

    SquareEquals(other)
    {
        return this.line === other.getLine() && this.row === other.getRow();
    }
  }
  
    

    