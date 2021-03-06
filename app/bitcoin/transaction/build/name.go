package build

import (
	"github.com/jchavannes/jgo/jerr"
	"github.com/memocash/memo/app/bitcoin/memo"
	"github.com/memocash/memo/app/bitcoin/wallet"
)

func SetName(name string, privateKey *wallet.PrivateKey) (*memo.Tx, error) {
	transactions := []memo.SpendOutput{{
		Type: memo.SpendOutputTypeMemoSetName,
		Data: []byte(name),
	}}
	tx, err := Build(transactions, privateKey)
	if err != nil {
		return nil, jerr.Get("error building memo set name tx", err)
	}
	return tx, nil
}
