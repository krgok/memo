package util

import (
	"regexp"
)

func ValidateBitcoinLegacyAddress(addr string) bool {
	var re = regexp.MustCompile(`[a-zA-Z0-9]{26,35}`)
	return re.MatchString(addr)
}

func ValidateProfilePicHeight(height string) bool {
	var re = regexp.MustCompile(`^(24|128|640)$`)
	return re.MatchString(height)
}

func ValidateImgurDirectLink(url string) bool {
	var re = regexp.MustCompile(`(^https://i\.imgur\.com/[a-zA-Z0-9]+\.(jpg|png)$)`)
	return re.MatchString(url)
}

func IsValidLang(lang string) bool {
	for _, item := range []string{"en-US", "es-LA", "zh-CN", "ja-JP", "fr-FR", "sv-SE", "ko-KR", "el-GR", "pl-PL", "pt-BR", "cs-CZ", "nl-NL"} {
		if item == lang {
			return true
		}
	}
	return false
}
