<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.css">
<link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.6-rc.0/css/select2.min.css" rel="stylesheet">

<div class="order">

    <?php if  (get_option( "ttorderform_card|status") == 'on'): ?>
    <!-- begin order card  -->
    <div class="order__card">
        <p><?= get_option( "ttorderform_card|value") ?></p>
    </div>
    <?php endif; ?>
    <!-- begin order__content  -->
    <div class="order__content">
        <form class="order-form">
            <!-- begin order-form__step  -->

            <div class="order-form__row">
                <div class="order-form__left">
                    <span> <?php if  (get_option( "ttorderform_type_of_paper|label")) echo get_option( "ttorderform_type_of_paper|label"); else echo 'Type of paper:';?></span>
                </div>

                <div class="order-form__right">
                    <select name="foc_o_paper_type">
                        <option value="1">Essay (Any Type)</option>
                        <option value="2">Admission Essay</option>
                        <option value="3">Annotated Bibliography</option>
                        <option value="4">Argumentative Essay</option>
                        <option value="5">Article Review</option>
                        <option value="6">Book/Movie Review</option>
                        <option value="7">Business Plan</option>
                        <option value="8">Case Study</option>
                        <option value="9">Coursework</option>
                        <option value="10">Creative Writing</option>
                        <option value="11">Critical Thinking</option>
                        <option value="12">Presentation or Speech</option>
                        <option value="13">Research Paper</option>
                        <option value="14">Research Proposal</option>
                        <option value="15">Term Paper</option>
                        <option value="16">Thesis</option>
                        <option value="17">Other</option>
                        <option value="18">Article (Any Type)</option>
                        <option value="19">Content (Any Type)</option>
                        <option value="20">Q&A</option>
                        <option value="21">Capstone Project</option>
                        <option value="22">Dissertation</option>
                        <option value="23">Lab Report</option>
                        <option value="24">Scholarship Essay</option>
                        <option value="25">Math Problem</option>
                        <option value="26">Statistic Project</option>
                        <option value="27">Research Summary</option>
                        <option value="28">Assignment</option>
                        <option value="29">Dissertation chapter</option>
                        <option value="30">Speech</option>
                    </select>
                </div>
            </div>

            <!-- begin order-form__row  -->
            <div class="order-form__row">
                <div class="order-form__left">
                    <span><?php if  (get_option( "ttorderform_topic|label")) echo get_option( "ttorderform_topic|label"); else echo 'Topic:';?></span>
                </div>

                <div class="order-form__right">
                    <input type="text" name="foc_o_name">
                </div>
            </div>
            <!-- end order-form__row -->

            <!-- begin order-form__row  -->
            <div class="order-form__row">
                <div class="order-form__left">
                    <span><?php if  (get_option( "ttorderform_subject|label")) echo get_option( "ttorderform_subject|label"); else echo 'Subject:';?></span>
                </div>

                <div class="order-form__right">
                    <select name="foc_o_subject">
                        <option value="" disabled="" selected="">Other *</option>
                        <option value="23">E-Commerce</option>
                        <option value="24">Finance</option>
                        <option value="25">International Affairs/Relations</option>
                        <option value="26">Investment</option>
                        <option value="27">Logistics</option>
                        <option value="28">Trade</option>
                        <option value="29">Education</option>
                        <option value="3">Dance</option>
                        <option value="30">Application Essay</option>
                        <option value="31">Education Theories</option>
                        <option value="32">Pedagogy</option>
                        <option value="33">Teacher's Career</option>
                        <option value="34">Engineering</option>
                        <option value="35">English</option>
                        <option value="36">Ethics</option>
                        <option value="37">History</option>
                        <option value="38">African-American Studies</option>
                        <option value="39">American History</option>
                        <option value="4">Design Analysis</option>
                        <option value="40">Asian Studies</option>
                        <option value="41">Canadian Studies</option>
                        <option value="42">East European Studies</option>
                        <option value="43">Holocaust</option>
                        <option value="44">Latin-American Studies</option>
                        <option value="45">Native-American Studies</option>
                        <option value="46">West European Studies</option>
                        <option value="47">Law</option>
                        <option value="48">Criminology</option>
                        <option value="49">Legal Issues</option>
                        <option value="5">Drama</option>
                        <option value="50">Linguistics</option>
                        <option value="51">Literature</option>
                        <option value="52">American Literature</option>
                        <option value="53">Antique Literature</option>
                        <option value="54">Asian Literature</option>
                        <option value="55">English Literature</option>
                        <option value="56">Shakespeare Studies</option>
                        <option value="57">Management</option>
                        <option value="58">Marketing</option>
                        <option value="59">Mathematics</option>
                        <option value="6">Movies</option>
                        <option value="60">Medicine and Health</option>
                        <option value="61">Alternative Medicine</option>
                        <option value="62">Healthcare</option>
                        <option value="63">Nursing</option>
                        <option value="64">Nutrition</option>
                        <option value="65">Pharmacology</option>
                        <option value="66">Sport</option>
                        <option value="67">Nature</option>
                        <option value="68">Agricultural Studies</option>
                        <option value="69">Anthropology</option>
                        <option value="7">Music</option>
                        <option value="70">Astronomy</option>
                        <option value="71">Environmental Issues</option>
                        <option value="72">Geography</option>
                        <option value="73">Geology</option>
                        <option value="74">Philosophy</option>
                        <option value="75">Physics</option>
                        <option value="76">Political Science</option>
                        <option value="77">Psychology</option>
                        <option value="78">Religion and Theology</option>
                        <option value="79">Sociology</option>
                        <option value="8">Painting</option>
                        <option value="80">Technology</option>
                        <option value="81">Aeronautics</option>
                        <option value="82">Aviation</option>
                        <option value="83">Computer Science</option>
                        <option value="84">Internet</option>
                        <option value="85">IT Management</option>
                        <option value="86">Web design</option>
                        <option value="87">Tourism</option>
                        <option value="88">Other</option>
                        <option value="9">Theatre</option>
                    </select>
                </div>
            </div>
            <!-- end order-form__row -->

            <!-- begin order-form__row  -->
            <div class="order-form__row">
                <div class="order-form__left">
                    <span><?php if  (get_option( "ttorderform_quantity|label")) echo get_option( "ttorderform_quantity|label"); else echo 'Number of pages:';?></span>
                </div>

                <div class="order-form__right order-form__right_xs">
                    <div class="order-form__input order-form__input-pages">
                        <div class="btn-number btn-plus"></div>
                        <div class="btn-number btn-minus"></div>

                        <input type="number" name="foc_o_pages" value="2" min="1">
                    </div>
                </div>
            </div>
            <!-- end order-form__row -->

            <!-- begin order-form__row  -->
            <div class="order-form__row order-form__row_top">
                <div class="order-form__left">
                    <span>Type of service:</span>
                </div>

                <div class="order-form__right">
                    <div class="order-form__radio">
                        <input type="radio" id="type1" name="foc_o_service" value="1">
                        <label for="type1">Writing from scratch</label>
                    </div>

                    <div class="order-form__radio">
                        <input type="radio" id="type2" name="foc_o_service" value="2">
                        <label for="type2">Rewriting</label>
                    </div>

                    <div class="order-form__radio">
                        <input type="radio" id="type3" name="foc_o_service" value="3">
                        <label for="type3">Editing</label>
                    </div>
                </div>
            </div>
            <!-- end order-form__row -->

            <!-- begin order-form__row  -->
            <div class="order-form__row">
                <div class="order-form__left">
                    <span>Format of citation:</span>
                </div>

                <div class="order-form__right order-form__right_sm">
                    <!-- <input type="text" placeholder="Format *" required> -->
                    <select name="foc_o_style">
                        <option value="" disabled selected>Format *</option>
                        <option value="1">MLA</option>
                        <option value="2">APA</option>
                        <option value="3">Chicago/Turabian</option>
                        <option value="6">Harvard</option>
                        <option value="7">Vancouver</option>
                        <option value="4">Not Applicable</option>
                        <option value="5">Other</option>
                    </select>

                    <div class="order-form__input">
                        <div class="btn-number btn-plus"></div>
                        <div class="btn-number btn-minus"></div>

                        <input type="number" name="foc_o_sources" placeholder="Numbers" min="1">
                    </div>
                </div>
            </div>
            <!-- end order-form__row -->

            <!-- begin order-form__row  -->
            <div class="order-form__row">
                <div class="order-form__left">
                    <span><?php if  (get_option( "ttorderform_deadline|label")) echo get_option( "ttorderform_deadline|label"); else echo 'Deadline:';?></span>
                </div>

                <div class="order-form__right order-form__right_sm">
                    <input type="text" class="order-form__date" readonly required>

                    <div class="order-form__input">
                        <input type="text" class="order-form__time" placeholder="14:00" readonly>
                    </div>
                </div>
            </div>
            <!-- end order-form__row -->

            <!-- begin order-form__row  -->
            <div class="order-form__row order-form__row_top">
                <div class="order-form__left">
                    <span><?php if  (get_option( "ttorderform_details|label")) echo get_option( "ttorderform_details|label"); else echo 'Paper instructions:';?></span>
                </div>

                <div class="order-form__right">
                    <textarea name="foc_o_desc"></textarea>
                </div>
            </div>
            <!-- end order-form__row -->




            <!-- begin order-form__row  -->
            <div class="order-form__row">
                <div class="order-form__left"></div>

                <div class="order-form__right">
                    <button type="button" id="order-btn" class="order__btn"><?php if  (get_option( "ttorderform_button|label")) echo get_option( "ttorderform_button|label"); else echo 'Order Now';?></button>
                </div>
            </div>
            <!-- end order-form__row -->

        </form>

        <div class="order__row">
            <?php if  (get_option( "ttorderform_col1|title")): ?>
            <ul>
                <li class="order__row-heading"><h3><?= get_option( "ttorderform_col1|title"); ?></h3></li>
                <?php
                    $items = explode("\n", get_option( "ttorderform_col1|items"));
                    foreach ($items as $item):
                ?>
                    <li><?= $item; ?></li>
                <?php
                    endforeach;
                ?>
            </ul>
            <?php endif; ?>

            <?php if  (get_option( "ttorderform_col2|title")): ?>
                <ul>
                    <li class="order__row-heading"><h3><?= get_option( "ttorderform_col2|title"); ?></h3></li>
                    <?php
                    $items = explode("\n", get_option( "ttorderform_col2|items"));
                    foreach ($items as $item):
                        ?>
                        <li><?= $item; ?></li>
                    <?php
                    endforeach;
                    ?>
                </ul>
            <?php endif; ?>

            <?php if  (get_option( "ttorderform_col2|title")): ?>
                <ul>
                    <li class="order__row-heading"><h3><?= get_option( "ttorderform_col2|title"); ?></h3></li>
                    <?php
                    $items = explode("\n", get_option( "ttorderform_col2|items"));
                    foreach ($items as $item):
                        ?>
                        <li><?= $item; ?></li>
                    <?php
                    endforeach;
                    ?>
                </ul>
            <?php endif; ?>

        </div>

        <?php if (get_option("ttorderform_slide1|title") || get_option("ttorderform_slide2|title") || get_option("ttorderform_slide3|title") ): ?>
        <!-- begin order-slider  -->
        <div class="order-slider">
            <div class="order-slider__inner">
                <!-- begin order-slider__item  -->
                <?php if (get_option("ttorderform_slide1|title")): ?>
                <div class="order-slider__item">
                    <div class="order-slider__text">
                        <h2><?= get_option("ttorderform_slide1|title"); ?></h2>
                        <h3><?= get_option("ttorderform_slide1|subtitle"); ?></h3>
                    </div>
                    <div class="order-slider__image">
                        <img src="<?= plugin_dir_url(__FILE__ ); ?>assets/img/order-slide-step1.png" alt="image">
                    </div>
                </div>
                <?php endif; ?>

                <?php if (get_option("ttorderform_slide2|title")): ?>
                <div class="order-slider__item">
                    <div class="order-slider__text">
                        <h2><?= get_option("ttorderform_slide2|title"); ?></h2>
                        <h3><?= get_option("ttorderform_slide2|subtitle"); ?></h3>
                    </div>

                    <div class="order-slider__image">
                        <img src="<?= plugin_dir_url(__FILE__ ); ?>assets/img/order-slide-step2.png" alt="image">
                    </div>
                </div>
                <?php endif; ?>

                <?php if (get_option("ttorderform_slide3|title")): ?>
                <div class="order-slider__item">
                    <div class="order-slider__text">
                        <h2><?= get_option("ttorderform_slide3|title"); ?></h2>
                        <h3><?= get_option("ttorderform_slide3|subtitle"); ?></h3>
                    </div>

                    <div class="order-slider__image">
                        <img src="<?= plugin_dir_url(__FILE__ ); ?>assets/img/order-slide-step3.png" alt="image">
                    </div>
                </div>
                <?php endif; ?>
            </div>
        </div>
        <!-- end order-slider -->
        <?php endif; ?>

    </div>
    <!-- end order__content -->

</div>

<!-- begin order-modal  -->
<div id="order-modal" class="order-modal">
    <div class="order-modal__tooltip">
        <span>Log in / Sign up</span>
    </div>

    <p>You need to Log in or Sign up for a new account in order to finish order placement process</p>

    <form>
        <span>Please enter your email to proceed</span>
        <input type="email" placeholder="Enter your email" name="foc_u_email" required>

        <button>Continue</button>
    </form>
</div>
<!-- end order-modal -->



<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.19.1/moment.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.6-rc.0/js/select2.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.js"></script>