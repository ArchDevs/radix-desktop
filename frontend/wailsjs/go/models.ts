export namespace service {
	
	export class Identity {
	    mnemonic: string;
	    address: string;
	
	    static createFrom(source: any = {}) {
	        return new Identity(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.mnemonic = source["mnemonic"];
	        this.address = source["address"];
	    }
	}

}

