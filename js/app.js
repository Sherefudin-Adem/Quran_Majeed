document.addEventListener("DOMContentLoaded", () =>{

    let chapters = null;
    const $chapter = $('#chapter');
    const $verse = $('#verse');
    const $result = $('.result');
    const $main = $('.main');
    const $info = $('.info');
    const $count = $('.count');
    const $star = $('.star');
    const $top = $('#top');
    const $search = $('#search');
    const $frmSearch = $('#frmSearch');
    const $searchBtn = $('#searchBtn');
    const $btnFavorites = $('#btnFavorites');

    // get all chapters
    function getChapters() {
        $.getJSON('./json/surah.json', (response) =>{
            chapters = response;
            $.each(chapters, (i, v) =>{
                $chapter.append('<option value="' + ++i + '">' + i + ' - ' + v.title + '</option>');
            });

            $chapter.attr('disabled', false);
        });
    }

    // read specific chapter
    $chapter.on('change', function (){
        let chapter = this.value;
        let data = [];

        if (!chapter) {
            $count.text('00');
            $info.hide();
            $result.hide();
            $top.hide();
            return;
        };

        $.getJSON('./json/surah/surah_' + chapter + '.json', (quran) =>{
            $.getJSON('./json/translation/en/en_translation_' + chapter + '.json', (trans) => {

                $verse.show();
                $count.show();
                $top.show();
                $verse.empty();
                $verse.append('<option value="">GoTo Verse</option>');
                $main.empty();

                $.each(trans.verse, (i, v) =>{
                    let starIcon = './img/star.png';

                    let verseNumber = i.replace(/\D/g, '');

                    if (localStorage.getItem('holy_quran_' + chapter + ':' + verseNumber)) {
                        starIcon = './img/stared.png';
                    }

                    $verse.append('<option value="' + verseNumber + '">' + verseNumber + '</option>');

                    let text = '<table width="100%">';
                    text += '<tr>';
                    text += '<td>';
                    text += '<div rel="verse_' + verseNumber + '" class="arabic alert alert-warning">' + quran.verse[i] + '</div>';
                    text += '<div class="trans alert alert-success">' + v + '</div>';
                    text += '</td>';
                    text += '<td rowspan="2" width="70" class="alert alert-success td_info"><span class="badge badge-primary stats">' + chapter + ':' + verseNumber + '</span><br><img class="star" src="' + starIcon + '"></td>';
                    text += '</tr>';
                    text += '</table>';

                    $main.append(text);
                });

                $info.text(chapter + ' - ' + quran.name);
                $count.text('Total Verses: ' + quran.count);
                $info.css('display', 'block');
                $result.css('display', 'block');
            });
        });
    });

    // star/unstar verses
    $(document).on('click', '.star', () =>{
        let verse = $(this).closest('td').find('.stats').text();
        let isStared = this.src.indexOf('stared') > -1;
        let key = 'holy_quran_' + verse;

        if (isStared) {
            localStorage.removeItem(key);
            this.src = './img/star.png';
        }
        else {
            localStorage.setItem(key, true);
            this.src = './img/stared.png';
        }
    });

    // load favorites/saved verses
    $btnFavorites.on('click', () =>{
        let total = 0;
        let prefix = 'holy_quran_';

        for (let i = 1; i <= 114; i++) {
            for (let j = 0; j <= 286; j++) {
                if (localStorage.getItem(prefix + i + ':' + j)) {
                    total++;

                    $verse.hide();
                    $main.empty();
                    $info.show();
                    $info.text('Favorite Verses');
                    $count.hide();
                    $result.show();
                    $top.show();
                    $chapter.val('');

                    (function (chapter, verse) {

                        $.getJSON('./json/surah/surah_' + chapter + '.json', (quran) =>{
                            $.getJSON('./json/translation/en/en_translation_' + chapter + '.json', (trans) =>{

                                $.each(trans.verse, (i, v) =>{
                                    let starIcon = './img/star.png';

                                    let verseNumber = i.replace(/\D/g, '');

                                    if (localStorage.getItem('holy_quran_' + chapter + ':' + verseNumber)) {
                                        starIcon = './img/stared.png';
                                    }

                                    if (verse == verseNumber) {

                                        let text = '<table width="100%">';
                                        text += '<tr>';
                                        text += '<td>';
                                        text += '<div rel="verse_' + verseNumber + '" class="arabic alert alert-warning">' + quran.verse[i] + '</div>';
                                        text += '<div class="trans alert alert-success">' + v + '</div>';
                                        text += '</td>';
                                        text += '<td rowspan="2" width="70" class="alert alert-success td_info"><span class="badge badge-primary stats">' + chapter + ':' + verseNumber + '</span><br><img class="star" src="' + starIcon + '"></td>';
                                        text += '</tr>';
                                        text += '</table>';

                                        $info.text('Favorite Verses (' + total + ')');
                                        $main.append(text);
                                    }
                                });

                            });
                        });

                    })(i, j);
                }
            }
        }
    });

    // go to verse
    $verse.on('change', function () {
        if (!this.value) {
            return;
        };

        $("html, body").animate({ scrollTop: $('div[rel="verse_' + this.value + '"]').offset().top }, 1000);
    });

    // go to top
    $top.on('click', () =>{
        $("html, body").animate({ scrollTop: 0 }, 1000);
    });

    // search translation
    $frmSearch.on('submit', () =>{
        let counter = 1;
        let total = 0;
        let keyword = $search.val();

        if (!keyword) {
            return false;
        }

        $searchBtn.attr('disabled', true);

        $verse.hide();
        $main.empty();
        $info.show();
        $info.text('Search Results');
        $count.hide();
        $result.show();
        $top.show();
        $chapter.val('');

        while (counter <= 114) {
            (function (counter) {

                $.getJSON('./json/translation/en/en_translation_' + counter + '.json', (trans) =>{
                    $.each(trans.verse, (i, v) =>{
                        if (v.indexOf(keyword) > -1 || v.toLowerCase().indexOf(keyword) > -1) {
                            $.getJSON('./json/surah/surah_' + counter + '.json', (quran) =>{
                                total++;

                                let starIcon = './img/star.png';

                                let verseNumber = i.replace(/\D/g, '');

                                if (localStorage.getItem('holy_quran_' + counter + ':' + verseNumber)) {
                                    starIcon = './img/stared.png';
                                }

                                let text = '<table width="100%">';
                                text += '<tr>';
                                text += '<td>';
                                text += '<div rel="verse_' + verseNumber + '" class="arabic alert alert-warning">' + quran.verse[i] + '</div>';
                                text += '<div class="trans alert alert-success">' + v + '</div>';
                                text += '</td>';
                                text += '<td rowspan="2" width="70" class="alert alert-Success td_info"><span class="badge badge-primary stats">' + counter + ':' + verseNumber + '</span><br><img class="star" src="' + starIcon + '"></td>';
                                text += '</tr>';
                                text += '</table>';

                                $info.text('Search Results (' + total + ')');
                                $searchBtn.attr('disabled', false);

                                $main.append(text);
                            });
                        }
                    });
                });

            })(counter);

            counter++;
        }

        return false;

    });

    getChapters();

});