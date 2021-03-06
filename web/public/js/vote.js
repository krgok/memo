(function () {
    var maxVoteCommentBytes = 184;
    /**
     * @param {string} formHash
     * @param {string} postTxHash
     * @param {boolean} postIsThreaded
     */
    MemoApp.Form.NewVote = function (formHash, postTxHash, postIsThreaded) {
        var $poll = $("#poll-" + formHash);
        var submitting = false;

        var txHash = postTxHash;
        var threaded = postIsThreaded;
        var $form = $poll.find("form");
        var $msgByteCount = $form.find(".message-byte-count");
        var $message = $form.find("[name=message]");
        var $broadcasting = $poll.find(".broadcasting");
        var $creating = $poll.find(".creating");
        var $results = $poll.find(".results");
        var $showVotesButton = $poll.find(".show-votes");
        var $votes = $poll.find(".votes");

        var $voteShowForm = $poll.find(".vote-show-form");
        var $cancelButton = $poll.find(".vote-cancel");

        setMsgByteCount();
        $message.on("input", function () {
            setMsgByteCount();
        });
        $voteShowForm.click(function (e) {
            e.preventDefault();
            hideVotes();
            $form.removeClass("hidden");
            $results.addClass("hidden");
        });
        $cancelButton.click(function (e) {
            e.preventDefault();
            $form.addClass("hidden");
            $results.removeClass("hidden");
        });
        $form.submit(function(e) {
            e.preventDefault();
            submitForm();
        });
        bindShowVotes();

        function setMsgByteCount() {
            var cnt = maxVoteCommentBytes - MemoApp.utf8ByteLength($message.val());
            $msgByteCount.html("[" + cnt + "]");
            if (cnt < 0) {
                $msgByteCount.addClass("red");
            } else {
                $msgByteCount.removeClass("red");
            }
        }

        function submitForm() {
            if (submitting) {
                return
            }

            var option = $form.find("[name=option]:checked").val();
            if (!option || option.length === 0) {
                MemoApp.AddAlert("Please select an option.");
                return;
            }

            var tip = $form.find("[name=tip]").val();
            if (tip.length !== 0 && tip < 546) {
                MemoApp.AddAlert("Please enter a tip greater than 546 (the minimum dust limit).");
                return;
            }

            var message = $message.val();
            if (maxVoteCommentBytes - MemoApp.utf8ByteLength(message) < 0) {
                MemoApp.AddAlert("Maximum message size is " + maxVoteCommentBytes + " bytes. Note that some characters are more than 1 byte." +
                    " Emojis are usually 4 bytes, for example.");
                return;
            }

            var password = MemoApp.GetPassword();
            if (!password.length) {
                console.log("Password not set. Please try logging in again.");
                return;
            }

            postForm(option, tip, message, password);
        }

        /**
         * @param {string} option
         * @param {string} tip
         * @param {string} message
         * @param {string} password
         */
        function postForm(option, tip, message, password) {
            submitting = true;
            $form.addClass("hidden");
            $results.removeClass("hidden");
            $creating.removeClass("hidden");
            $.ajax({
                type: "POST",
                url: MemoApp.GetBaseUrl() + MemoApp.URL.PollVoteSubmit,
                data: {
                    txHash: txHash,
                    option: option,
                    tip: tip,
                    message: message,
                    password: password
                },
                success: function (voteTxHash) {
                    submitting = false;
                    $creating.addClass("hidden");
                    $broadcasting.removeClass("hidden");
                    if (!voteTxHash || voteTxHash.length === 0) {
                        MemoApp.AddAlert("Server error. Please try refreshing the page.");
                        return
                    }
                    $.ajax({
                        type: "POST",
                        url: MemoApp.GetBaseUrl() + MemoApp.URL.MemoWaitSubmit,
                        data: {
                            txHash: voteTxHash
                        },
                        success: function () {
                            submitting = false;
                            var url = MemoApp.URL.MemoPostAjax;
                            if (threaded) {
                                url = MemoApp.URL.MemoPostThreadedAjax
                            }
                            $.ajax({
                                url: MemoApp.GetBaseUrl() + url + "/" + txHash,
                                success: function (html) {
                                    $("#post-" + formHash).replaceWith(html);
                                },
                                error: function (xhr) {
                                    MemoApp.AddAlert("error getting post via ajax (status: " + xhr.status + ")");
                                }
                            });
                        },
                        error: function () {
                            submitting = false;
                            $broadcasting.addClass("hidden");
                            console.log("Error waiting for transaction to broadcast.");
                        }
                    });
                },
                error: function (xhr) {
                    submitting = false;
                    if (xhr.status === 401) {
                        MemoApp.AddAlert("Error unlocking key. " +
                            "Please verify your password is correct. " +
                            "If this problem persists, please try refreshing the page.");
                        return;
                    } else if (xhr.status === 402) {
                        MemoApp.AddAlert("Please make sure your account has enough funds.");
                        return;
                    }
                    var errorMessage =
                        "Error with request (option code " + xhr.status + "):\n" +
                        (xhr.optionText !== "" ? xhr.optionText + "\n" : "") +
                        "If this problem persists, try refreshing the page.";
                    MemoApp.AddAlert(errorMessage);
                }
            });
        }
        function bindShowVotes() {
            $showVotesButton.click(function(e) {
                e.preventDefault();
                if (!$votes.hasClass("hidden")) {
                    hideVotes();
                    return;
                }
                if ($votes.html().length > 0) {
                    showVotes();
                    return;
                }
                $.ajax({
                    url: MemoApp.GetBaseUrl() + MemoApp.URL.PollVotesAjax,
                    data: {
                        txHash: postTxHash
                    },
                    success: function (html) {
                        showVotes();
                        $votes.html(html);
                    },
                    error: function () {
                        console.log("Error waiting for transaction to broadcast.");
                    }
                });
            });
        }
        function showVotes() {
            $votes.removeClass("hidden");
            $showVotesButton.html("Hide Votes");
        }
        function hideVotes() {
            $votes.addClass("hidden");
            $showVotesButton.html("Show Votes");
        }
    };
})();
